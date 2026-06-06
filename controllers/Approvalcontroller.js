const Approval = require('../models/Approval');
const Quotation = require('../models/Quotation');
const RFQ = require('../models/RFQ');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { logActivity } = require('../utils/ActivityLogger');
const { createNotification } = require('../utils/Notificationhelper');
const { sendApprovalEmail } = require('../utils/emailService');

// @desc    Initiate approval workflow for a shortlisted quotation
// @route   POST /api/approvals
// @access  Private (procurement_officer, admin)
exports.initiateApproval = asyncHandler(async (req, res) => {
  const { quotationId, approverIds } = req.body;

  const quotation = await Quotation.findById(quotationId)
    .populate('rfq', 'rfqNumber title')
    .populate('vendor', 'companyName');

  if (!quotation) {
    return res.status(404).json({ success: false, message: 'Quotation not found.' });
  }

  if (quotation.status !== 'shortlisted') {
    return res.status(400).json({ success: false, message: 'Only shortlisted quotations can be sent for approval.' });
  }

  // Check duplicate approval request
  const existingApproval = await Approval.findOne({
    quotation: quotationId,
    status: { $in: ['pending', 'approved'] },
  });
  if (existingApproval) {
    return res.status(400).json({ success: false, message: 'Approval already exists for this quotation.' });
  }

  // Build approval steps
  const steps = approverIds.map((approverId, idx) => ({
    approver: approverId,
    order: idx + 1,
    status: 'pending',
  }));

  const approval = await Approval.create({
    rfq: quotation.rfq._id,
    quotation: quotationId,
    vendor: quotation.vendor._id,
    requestedBy: req.user._id,
    steps,
    currentStep: 1,
    totalAmount: quotation.totalAmount,
  });

  // Update quotation status
  quotation.status = 'under_review';
  await quotation.save();

  // Notify first approver
  const firstApprover = await User.findById(approverIds[0]);
  if (firstApprover) {
    await createNotification({
      recipients: [firstApprover._id],
      title: 'Approval Required',
      message: `Your approval is required for: ${quotation.rfq.rfqNumber} - ${quotation.rfq.title} (Vendor: ${quotation.vendor.companyName})`,
      type: 'approval_requested',
      relatedModel: 'Approval',
      relatedId: approval._id,
    });
  }

  await logActivity({
    userId: req.user._id,
    action: 'INITIATE_APPROVAL',
    module: 'Approval',
    description: `Approval initiated for quotation: ${quotation.quotationNumber}`,
    relatedModel: 'Approval',
    relatedId: approval._id,
  });

  res.status(201).json({ success: true, data: approval });
});

// @desc    Get all approvals
// @route   GET /api/approvals
// @access  Private
exports.getApprovals = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;

  // Managers/approvers only see approvals assigned to them
  if (req.user.role === 'manager') {
    filter['steps.approver'] = req.user._id;
  }

  const [approvals, total] = await Promise.all([
    Approval.find(filter)
      .populate('rfq', 'rfqNumber title category')
      .populate('quotation', 'quotationNumber totalAmount items')
      .populate('vendor', 'companyName email contactPerson')
      .populate('requestedBy', 'firstName lastName email')
      .populate('steps.approver', 'firstName lastName email role')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit)),
    Approval.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: approvals.length,
    total,
    page: Number(page),
    data: approvals,
  });
});

// @desc    Get single approval
// @route   GET /api/approvals/:id
// @access  Private
exports.getApproval = asyncHandler(async (req, res) => {
  const approval = await Approval.findById(req.params.id)
    .populate('rfq', 'rfqNumber title category items deadline')
    .populate('quotation', 'quotationNumber items subtotal taxAmount totalAmount deliveryTimeline paymentTerms notes')
    .populate('vendor', 'companyName email phone contactPerson gstNumber address')
    .populate('requestedBy', 'firstName lastName email')
    .populate('steps.approver', 'firstName lastName email role');

  if (!approval) {
    return res.status(404).json({ success: false, message: 'Approval not found.' });
  }

  res.status(200).json({ success: true, data: approval });
});

// @desc    Approve or reject a step
// @route   PATCH /api/approvals/:id/action
// @access  Private (manager, admin)
exports.processApproval = asyncHandler(async (req, res) => {
  const { action, remarks } = req.body; // action: 'approve' | 'reject'

  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).json({ success: false, message: 'Action must be approve or reject.' });
  }

  const approval = await Approval.findById(req.params.id)
    .populate('rfq', 'rfqNumber title')
    .populate('quotation', 'quotationNumber')
    .populate('vendor', 'companyName')
    .populate('requestedBy', 'firstName lastName email');

  if (!approval) {
    return res.status(404).json({ success: false, message: 'Approval not found.' });
  }

  if (approval.status !== 'pending') {
    return res.status(400).json({ success: false, message: `Approval is already ${approval.status}.` });
  }

  // Find the current step assigned to this user
  const currentStepObj = approval.steps.find(
    (s) => s.order === approval.currentStep && s.approver.toString() === req.user._id.toString()
  );

  if (!currentStepObj) {
    return res.status(403).json({
      success: false,
      message: 'You are not the current approver for this request.',
    });
  }

  currentStepObj.status = action === 'approve' ? 'approved' : 'rejected';
  currentStepObj.remarks = remarks;
  currentStepObj.actionAt = Date.now();

  if (action === 'reject') {
    // Reject the whole approval
    approval.status = 'rejected';
    approval.rejectedAt = Date.now();
    approval.finalRemarks = remarks;

    // Revert quotation status
    await Quotation.findByIdAndUpdate(approval.quotation._id, { status: 'shortlisted' });

    // Notify requester
    await createNotification({
      recipients: [approval.requestedBy._id],
      title: 'Approval Rejected',
      message: `Procurement approval for ${approval.rfq.rfqNumber} has been rejected by ${req.user.firstName} ${req.user.lastName}.`,
      type: 'approval_rejected',
      relatedModel: 'Approval',
      relatedId: approval._id,
    });

    try {
      await sendApprovalEmail({
        to: approval.requestedBy.email,
        name: `${approval.requestedBy.firstName} ${approval.requestedBy.lastName}`,
        rfqTitle: `${approval.rfq.rfqNumber} - ${approval.rfq.title}`,
        status: 'rejected',
        remarks,
      });
    } catch (e) {
      console.error('Approval email error:', e.message);
    }
  } else {
    // Approved — check if there are more steps
    const nextStep = approval.currentStep + 1;
    const nextStepObj = approval.steps.find((s) => s.order === nextStep);

    if (nextStepObj) {
      // Advance to next approver
      approval.currentStep = nextStep;

      // Notify next approver
      await createNotification({
        recipients: [nextStepObj.approver],
        title: 'Approval Required',
        message: `Your approval is required for: ${approval.rfq.rfqNumber} - ${approval.rfq.title}`,
        type: 'approval_requested',
        relatedModel: 'Approval',
        relatedId: approval._id,
      });
    } else {
      // All steps approved
      approval.status = 'approved';
      approval.approvedAt = Date.now();
      approval.finalRemarks = remarks;

      // Update quotation status
      await Quotation.findByIdAndUpdate(approval.quotation._id, { status: 'approved' });

      // Mark RFQ as awarded
      await RFQ.findByIdAndUpdate(approval.rfq._id, {
        status: 'awarded',
        awardedTo: approval.vendor,
      });

      // Notify requester
      await createNotification({
        recipients: [approval.requestedBy._id],
        title: 'Approval Approved',
        message: `Procurement approval for ${approval.rfq.rfqNumber} has been fully approved!`,
        type: 'approval_approved',
        relatedModel: 'Approval',
        relatedId: approval._id,
      });

      try {
        await sendApprovalEmail({
          to: approval.requestedBy.email,
          name: `${approval.requestedBy.firstName} ${approval.requestedBy.lastName}`,
          rfqTitle: `${approval.rfq.rfqNumber} - ${approval.rfq.title}`,
          status: 'approved',
          remarks,
        });
      } catch (e) {
        console.error('Approval email error:', e.message);
      }
    }
  }

  await approval.save();

  await logActivity({
    userId: req.user._id,
    action: action === 'approve' ? 'APPROVE' : 'REJECT',
    module: 'Approval',
    description: `Approval ${action}d for ${approval.rfq.rfqNumber} by ${req.user.firstName} ${req.user.lastName}`,
    relatedModel: 'Approval',
    relatedId: approval._id,
  });

  res.status(200).json({ success: true, data: approval });
});

// @desc    Cancel an approval request
// @route   PATCH /api/approvals/:id/cancel
// @access  Private (procurement_officer, admin)
exports.cancelApproval = asyncHandler(async (req, res) => {
  const approval = await Approval.findById(req.params.id);
  if (!approval) {
    return res.status(404).json({ success: false, message: 'Approval not found.' });
  }

  if (approval.status !== 'pending') {
    return res.status(400).json({ success: false, message: 'Only pending approvals can be cancelled.' });
  }

  approval.status = 'cancelled';
  await approval.save();

  // Revert quotation status
  await Quotation.findByIdAndUpdate(approval.quotation, { status: 'shortlisted' });

  res.status(200).json({ success: true, data: approval });
});