import React from "react";
import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "MovieScore",
  description: "Rate movies and TV series, share with friends, and get recommendations.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
