import React from "react";
import { platformTagline } from "@moviescore/shared";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <main className="container">
      <h1>MovieScore</h1>
      <p>{platformTagline}</p>
      <p>SSR-ready Next.js app is running.</p>
    </main>
  );
}
