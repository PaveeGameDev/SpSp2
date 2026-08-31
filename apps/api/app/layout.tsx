import type { Metadata } from "next";
import { Big_Shoulders_Stencil, Rajdhani } from "next/font/google";
import Link from "next/link";

import { getSessionUser } from "@/lib/getSessionUser";

import "./globals.css";

const stencil = Big_Shoulders_Stencil({
  variable: "--font-stencil",
  subsets: ["latin"],
  weight: ["700", "800"],
});

const rajdhani = Rajdhani({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "SpeedySponsor — Team H.E.I.S.T. #10077",
  description: "Log the job, count the loot, unlock the crew's monthly sponsor vault.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getSessionUser();

  return (
    <html lang="en" className={`${stencil.variable} ${rajdhani.variable}`}>
      <body>
        {user && (
          <header className="header">
            <Link href="/" className="brand">
              <span className="vault-dial" aria-hidden="true" />
              SpeedySponsor
            </Link>
            <nav>
              <Link href="/leaderboard">Most Wanted</Link>
              <Link href="/history">Rap Sheet</Link>
              <Link href="/log">Pull a Job</Link>
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
