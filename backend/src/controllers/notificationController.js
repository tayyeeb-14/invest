const asyncHandler = require("../utils/asyncHandler");
const Notification = require("../models/Notification");

const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({
    $or: [
      { user: req.user._id },
      { user: null, targetRole: "all" },
      { user: null, targetRole: req.user.role }
    ]
  })
    .sort({ createdAt: -1 })
    .limit(20);

  res.json({ success: true, notifications });
});

const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    res.status(404);
    throw new Error("Notification not found.");
  }

  const canAccess =
    String(notification.user) === String(req.user._id) ||
    (notification.user === null &&
      (notification.targetRole === "all" || notification.targetRole === req.user.role));

  if (!canAccess) {
    res.status(403);
    throw new Error("Access denied.");
  }

  notification.isRead = true;
  await notification.save();

  res.json({ success: true, message: "Notification marked as read." });
});

module.exports = { getMyNotifications, markNotificationRead };
