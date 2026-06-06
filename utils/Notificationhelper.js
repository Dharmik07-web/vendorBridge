const Notification = require('../models/Notification');

/**
 * Create a notification for one or more users
 * @param {object} params
 * @param {string|string[]} params.recipients - User ObjectId(s)
 * @param {string} params.title
 * @param {string} params.message
 * @param {string} params.type - Notification type enum
 * @param {string} [params.relatedModel]
 * @param {string} [params.relatedId]
 */
const createNotification = async ({
  recipients,
  title,
  message,
  type = 'general',
  relatedModel = null,
  relatedId = null,
}) => {
  try {
    const ids = Array.isArray(recipients) ? recipients : [recipients];
    const docs = ids.map((recipient) => ({
      recipient,
      title,
      message,
      type,
      relatedModel,
      relatedId,
    }));
    await Notification.insertMany(docs);
  } catch (err) {
    console.error('⚠️  Notification creation error:', err.message);
  }
};

module.exports = { createNotification };