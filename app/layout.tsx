import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AlumConnect Dashboard — Vedantu",
  description: "Chief of Staff dashboard for managing Vedantu alumni registrations.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
