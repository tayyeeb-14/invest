import clsx from "clsx";

export default function Button({
  children,
  className = "",
  variant = "primary",
  disabled = false,
  ...props
}) {
  const base =
    "rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40";
  const styles = {
    primary: "bg-brand text-slate-950 hover:bg-emerald-400",
    secondary: "bg-panelSoft text-textMain border border-line hover:border-accent/60",
    ghost: "bg-transparent text-textSub hover:text-textMain"
  };

  return (
    <button className={clsx(base, styles[variant], className)} disabled={disabled} {...props}>
      {children}
    </button>
  );
}
