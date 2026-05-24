const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
    default: 'system',
    index: true
  },
  action: {
    type: String,
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
module.exports = ActivityLog;
