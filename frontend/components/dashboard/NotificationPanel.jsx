export default function NotificationPanel({ notifications = [] }) {
  return (
    <div className="glass rounded-2xl p-4">
      <p className="mb-3 text-sm font-semibold">Notifications</p>
      <div className="space-y-2">
        {notifications.length ? (
          notifications.slice(0, 6).map((n) => (
            <article key={n._id} className="rounded-xl border border-line bg-panel p-3">
              <p className="text-sm font-medium">{n.title}</p>
              <p className="mt-1 text-xs text-textSub">{n.message}</p>
            </article>
          ))
        ) : (
          <p className="text-sm text-textSub">No notifications available.</p>
        )}
      </div>
    </div>
  );
}
