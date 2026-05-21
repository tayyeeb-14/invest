import Link from "next/link";

export default function AuthShell({ title, subtitle, children, footerText, footerHref, footerLabel }) {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <section className="glass w-full max-w-md rounded-3xl p-6">
        <Link href="/" className="text-xs tracking-[0.25em] text-accent">
          TRUSTVEST
        </Link>
        <h1 className="mt-4 text-3xl">{title}</h1>
        <p className="mt-2 text-sm text-textSub">{subtitle}</p>
        <div className="mt-6">{children}</div>
        <p className="mt-5 text-sm text-textSub">
          {footerText}{" "}
          <Link className="text-brand underline" href={footerHref}>
            {footerLabel}
          </Link>
        </p>
      </section>
    </main>
  );
}
