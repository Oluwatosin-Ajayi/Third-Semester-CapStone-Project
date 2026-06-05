import type { Metadata } from "next";
import { Inter } from "next/font/google";
//import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Carefinder — Nigeria's Hospital Directory",
  description: "Find hospitals near you across Nigeria",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}