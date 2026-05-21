import { Manrope, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"]
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700"]
});

export const metadata = {
  title: "TrustVest | Secure Investment Platform",
  description:
    "TrustVest is a premium investment platform for secure deposits, level-based growth, and transparent daily profit tracking.",
  keywords: [
    "TrustVest",
    "investment platform",
    "secure wallet",
    "daily profit tracker",
    "fintech app"
  ],
  openGraph: {
    title: "TrustVest",
    description: "Secure and trusted fintech investment experience.",
    type: "website"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${playfair.variable} bg-bg text-textMain`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
