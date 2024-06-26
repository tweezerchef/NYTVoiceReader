import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SectionProvider } from "./contexts/SectionContext";
import { ArticleProvider } from "./contexts/ArticleContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "New York Times Reader",
  description: "Navigate the New York Times with your voice",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <SectionProvider>
        <ArticleProvider>
          <body className={inter.className}>{children}</body>
        </ArticleProvider>
      </SectionProvider>
    </html>
  );
}
