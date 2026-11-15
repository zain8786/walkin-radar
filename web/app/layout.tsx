import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "WalkIn Radar",
  description: "Walk-in interviews for freshers in Delhi NCR, with eligibility for your profile.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <Link href="/" className="font-semibold text-indigo-700">WalkIn Radar</Link>
            <div className="flex gap-4 text-sm">
              <Link href="/" className="text-slate-700 hover:text-indigo-700">Drives</Link>
              <Link href="/profiles" className="text-slate-700 hover:text-indigo-700">Profiles</Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
        <footer className="mx-auto max-w-5xl px-4 pb-10 pt-4 text-xs text-slate-500">
          A match is not a guarantee of selection. Confirm details on the source page before you travel.
        </footer>
      </body>
    </html>
  );
}
