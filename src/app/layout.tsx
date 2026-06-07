import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CareFinder - Digital Search for Hospitals in Nigeria",
  description: "Find hospitals close to you from the comfort of your phone.",
  keywords: ["hospital", "Nigeria", "healthcare", "directory", "clinic"],
  openGraph: {
    title: "CareFinder - Digital Search for Hospitals in Nigeria",
    description: "Find hospitals close to you from the comfort of your phone.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-gray-50 text-gray-900 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
