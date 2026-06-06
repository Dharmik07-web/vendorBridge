const express = require("express");
const router = express.Router();

// ─── Health Check ─────────────────────────────────────────────────────────────
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "VendorBridge API is running",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ─── Module Routes ────────────────────────────────────────────────────────────
router.use("/auth",        require("./auth.routes"));

// The following routes will be added in subsequent modules:
// router.use("/vendors",     require("./vendor.routes"));
// router.use("/rfqs",        require("./rfq.routes"));
// router.use("/quotations",  require("./quotation.routes"));
// router.use("/approvals",   require("./approval.routes"));
// router.use("/purchase-orders", require("./purchaseOrder.routes"));
// router.use("/invoices",    require("./invoice.routes"));
// router.use("/notifications", require("./notification.routes"));
// router.use("/dashboard",   require("./dashboard.routes"));
// router.use("/users",       require("./user.routes"));

module.exports = router;
