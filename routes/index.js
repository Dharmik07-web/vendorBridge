const express = require('express');
const router = express.Router();

// Import all route modules
const authRoutes = require('./auth.routes');
const vendorRoutes = require('./vendorRoutes');
const rfqRoutes = require('./rfqRoutes');
const quotationRoutes = require('./quotationRoutes');
const approvalRoutes = require('./approvalRoutes');
const purchaseOrderRoutes = require('./purchaseOrderRoutes');
const invoiceRoutes = require('./invoiceRoutes');
const notificationRoutes = require('./notificationRoutes');
const dashboardRoutes = require('./dashboardRoutes');

// ─── Route Aggregation ─────────────────────────────────────────────────────
router.use('/auth', authRoutes);
router.use('/vendors', vendorRoutes);
router.use('/rfqs', rfqRoutes);
router.use('/quotations', quotationRoutes);
router.use('/approvals', approvalRoutes);
router.use('/purchase-orders', purchaseOrderRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/notifications', notificationRoutes);
router.use('/dashboard', dashboardRoutes);

// ─── Base Route ───────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'VendorBridge API v1',
    routes: [
      '/auth',
      '/vendors',
      '/rfqs',
      '/quotations',
      '/approvals',
      '/purchase-orders',
      '/invoices',
      '/notifications',
      '/dashboard',
      '/health'
    ]
  });
});

// ─── Health Check ─────────────────────────────────────────────────────────
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'VendorBridge API is running',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
