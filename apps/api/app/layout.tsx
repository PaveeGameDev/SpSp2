import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";

import { getSessionUser } from "@/lib/getSessionUser";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SpeedySponsor",
  description: "Log sponsor outreach, earn points, unlock the team's monthly $ pool.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getSessionUser();

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        {user && (
          <header className="header">
            <Link href="/" style={{ fontWeight: 700 }}>
              SpeedySponsor
            </Link>
            <nav>
              <Link href="/leaderboard">Leaderboard</Link>
              <Link href="/history">History</Link>
              <Link href="/log">Log activity</Link>
              <span className="avatar" title={user.name}>
                {user.name.slice(0, 1).toUpperCase()}
              </span>
              <form action="/api/auth/logout" method="POST">
                <button type="submit" className="button" style={{ padding: "6px 10px", fontSize: 13 }}>
                  Sign out
                </button>
              </form>
            </nav>
          </header>
        )}
        <div className="page">{children}</div>
      </body>
    </html>
  );
}
