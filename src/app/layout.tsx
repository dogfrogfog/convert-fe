import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] }) as any;

export const metadata: Metadata = {
  title: "Image Converter",
  description: "Convert your images to different formats",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.font}>{children}</body>
    </html>
  );
}
