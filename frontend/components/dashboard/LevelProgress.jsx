export default function LevelProgress({ level }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center justify-between text-sm">
        <p className="font-semibold">Level {level?.unlocked || 1}</p>
        <p className="text-textSub">
          {level?.nextThreshold ? `Next unlock at ₹${level.nextThreshold}` : "Maximum level reached"}
        </p>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-panelSoft">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand to-accent"
          style={{ width: `${level?.progressPercent || 0}%` }}
        />
      </div>
    </div>
  );
}
