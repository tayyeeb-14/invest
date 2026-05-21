export default function Footer() {
  return (
    <footer className="border-t border-line py-8">
      <div className="section-wrap flex flex-col gap-2 text-sm text-textSub md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} TrustVest Financial Technologies Pvt. Ltd.</p>
        <p>Secure. Verified. Transparent investment operations.</p>
      </div>
    </footer>
  );
}
