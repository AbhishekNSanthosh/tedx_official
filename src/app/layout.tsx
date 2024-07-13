import React from "react";
import type { Metadata } from "next";
import "@styles/scss/main.scss";
import HeaderView from "@widgets/Header";
import FooterView from "@widgets/Footer";

export const metadata: Metadata = {
  title: "TEDˣCCET",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <HeaderView />
        {children}
        <FooterView />
      </body>
    </html>
  );
}
