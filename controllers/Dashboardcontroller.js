const RFQ = require('../models/RFQ');
const Quotation = require('../models/Quotation');
const Approval = require('../models/Approval');
const PurchaseOrder = require('../models/PurchaseOrder');
const Invoice = require('../models/Invoice');
const Vendor = require('../models/Vendor');
const ActivityLog = require('../models/ActivityLog');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Main dashboard summary
// @route   GET /api/dashboard/summary
// @access  Private
exports.getDashboardSummary = asyncHandler(async (req, res) => {
  const isVendor = req.user.role === 'vendor';
  const vendorId = req.user.vendorProfile;

  if (isVendor) {
    // Vendor-specific dashboard
    const [myQuotations, myPOs, myInvoices, pendingRFQs] = await Promise.all([
      Quotation.countDocuments({ vendor: vendorId }),
      PurchaseOrder.countDocuments({ vendor: vendorId }),
      Invoice.countDocuments({ vendor: vendorId }),
      RFQ.countDocuments({ 'assignedVendors.vendor': vendorId, status: 'published' }),
    ]);

    const recentPOs = await PurchaseOrder.find({ vendor: vendorId })
      .populate('rfq', 'rfqNumber title')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentInvoices = await Invoice.find({ vendor: vendorId })
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      data: {
        stats: { myQuotations, myPOs, myInvoices, pendingRFQs },
        recentPOs,
        recentInvoices,
      },
    });
  }

  // Procurement team / admin dashboard
  const [
    activeRFQs,
    pendingApprovals,
    totalVendors,
    totalPOs,
    totalInvoicesThisMonth,
    spendThisMonth,
    recentRFQs,
    recentApprovals,
    recentPOs,
    recentInvoices,
  ] = await Promise.all([
    RFQ.countDocuments({ status: 'published' }),
    Approval.countDocuments({ status: 'pending' }),
    Vendor.countDocuments({ status: 'active' }),
    PurchaseOrder.countDocuments(),
    Invoice.countDocuments({
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
    }),
    Invoice.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        },
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    RFQ.find().sort({ createdAt: -1 }).limit(5).populate('createdBy', 'firstName lastName'),
    Approval.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('rfq', 'rfqNumber title')
      .populate('vendor', 'companyName'),
    PurchaseOrder.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('vendor', 'companyName')
      .populate('rfq', 'rfqNumber title'),
    Invoice.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('vendor', 'companyName')
      .populate('purchaseOrder', 'poNumber'),
  ]);

  const totalSpend = spendThisMonth[0]?.total || 0;

  res.status(200).json({
    success: true,
    data: {
      stats: {
        activeRFQs,
        pendingApprovals,
        totalVendors,
        totalPOs,
        totalInvoicesThisMonth,
        spendThisMonth: totalSpend,
      },
      recentRFQs,
      recentApprovals,
      recentPOs,
      recentInvoices,
    },
  });
});

// @desc    Procurement analytics (reports page)
// @route   GET /api/dashboard/analytics
// @access  Private (admin, procurement_officer, manager)
exports.getAnalytics = asyncHandler(async (req, res) => {
  const { year = new Date().getFullYear(), month } = req.query;
  const yearNum = Number(year);

  // Monthly procurement spend trend (12 months)
  const monthlySpend = await Invoice.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(`${yearNum}-01-01`),
          $lte: new Date(`${yearNum}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { month: { $month: '$createdAt' } },
        totalSpend: { $sum: '$totalAmount' },
        invoiceCount: { $sum: 1 },
      },
    },
    { $sort: { '_id.month': 1 } },
  ]);

  // Spend by vendor category
  const spendByCategory = await PurchaseOrder.aggregate([
    {
      $lookup: {
        from: 'vendors',
        localField: 'vendor',
        foreignField: '_id',
        as: 'vendorData',
      },
    },
    { $unwind: '$vendorData' },
    { $unwind: '$vendorData.category' },
    {
      $group: {
        _id: '$vendorData.category',
        totalSpend: { $sum: '$totalAmount' },
        poCount: { $sum: 1 },
      },
    },
    { $sort: { totalSpend: -1 } },
  ]);

  // Top vendors by spend
  const topVendors = await PurchaseOrder.aggregate([
    {
      $group: {
        _id: '$vendor',
        totalSpend: { $sum: '$totalAmount' },
        poCount: { $sum: 1 },
      },
    },
    { $sort: { totalSpend: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'vendors',
        localField: '_id',
        foreignField: '_id',
        as: 'vendorInfo',
      },
    },
    { $unwind: '$vendorInfo' },
    {
      $project: {
        vendorName: '$vendorInfo.companyName',
        email: '$vendorInfo.email',
        totalSpend: 1,
        poCount: 1,
      },
    },
  ]);

  // RFQ stats
  const rfqStats = await RFQ.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  // Quotation stats
  const quotationStats = await Quotation.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  // Approval efficiency (avg time from request to approval)
  const approvalEfficiency = await Approval.aggregate([
    { $match: { status: 'approved', approvedAt: { $exists: true } } },
    {
      $project: {
        daysToApprove: {
          $divide: [
            { $subtract: ['$approvedAt', '$createdAt'] },
            1000 * 60 * 60 * 24,
          ],
        },
      },
    },
    { $group: { _id: null, avgDays: { $avg: '$daysToApprove' } } },
  ]);

  // Invoice payment stats
  const paymentStats = await Invoice.aggregate([
    { $group: { _id: '$paymentStatus', count: { $sum: 1 }, amount: { $sum: '$totalAmount' } } },
  ]);

  // Totals
  const [totalSpend, activeVendors, totalRFQs, totalPOs] = await Promise.all([
    Invoice.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
    Vendor.countDocuments({ status: 'active' }),
    RFQ.countDocuments(),
    PurchaseOrder.countDocuments(),
  ]);

  res.status(200).json({
    success: true,
    data: {
      overview: {
        totalSpend: totalSpend[0]?.total || 0,
        activeVendors,
        totalRFQs,
        totalPOs,
        avgApprovalDays: approvalEfficiency[0]?.avgDays?.toFixed(1) || 0,
      },
      monthlySpend,
      spendByCategory,
      topVendors,
      rfqStats,
      quotationStats,
      paymentStats,
    },
  });
});

// @desc    Activity logs
// @route   GET /api/dashboard/activity
// @access  Private
exports.getActivityLogs = asyncHandler(async (req, res) => {
  const { module: mod, page = 1, limit = 50 } = req.query;
  const filter = {};
  if (mod) filter.module = mod;

  // Non-admins only see their own logs
  if (!['admin', 'manager'].includes(req.user.role)) {
    filter.user = req.user._id;
  }

  const [logs, total] = await Promise.all([
    ActivityLog.find(filter)
      .populate('user', 'firstName lastName email role')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit)),
    ActivityLog.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: logs.length,
    total,
    page: Number(page),
    data: logs,
  });
});