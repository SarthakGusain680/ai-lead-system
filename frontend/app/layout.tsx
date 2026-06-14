import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Lead Follow-Up System",
  description: "AI-powered CRM for lead management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}