import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NotificationContainer from "@/components/notifications/NotificationContainer";

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "Messenger - Connect Instantly, Chat Securely",
  description: "A modern, real-time messenger application with end-to-end encryption",
  keywords: ["chat", "messenger", "real-time", "secure messaging"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <NotificationContainer />
      </body>
    </html>
  );
}
