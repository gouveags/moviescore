import React from "react";
import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "MovieScore",
  description:
    "MovieScore helps you decide what to watch next using expectation and post-watch outcomes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
