const ActivityLog = require('../models/ActivityLog');

/**
 * Create an activity log entry
 * @param {object} params
 * @param {string} params.userId - User ObjectId (nullable)
 * @param {string} params.action - Short action name (e.g. 'CREATE_RFQ')
 * @param {string} params.module - Module name
 * @param {string} params.description - Human-readable description
 * @param {string} [params.relatedModel] - Related Mongoose model name
 * @param {string} [params.relatedId] - Related document ObjectId
 * @param {string} [params.ipAddress] - Request IP
 * @param {object} [params.metadata] - Extra data
 */
const logActivity = async ({
  userId = null,
  action,
  module,
  description,
  relatedModel = null,
  relatedId = null,
  ipAddress = null,
  metadata = null,
}) => {
  try {
    await ActivityLog.create({
      user: userId,
      action,
      module,
      description,
      relatedModel,
      relatedId,
      ipAddress,
      metadata,
    });
  } catch (err) {
    // Activity logging should never crash the main flow
    console.error('⚠️  Activity log error:', err.message);
  }
};

module.exports = { logActivity };