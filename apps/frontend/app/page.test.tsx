import React from "react";
import { render, screen } from "@testing-library/react";
import HomePage from "./page";

describe("HomePage", () => {
  it("renders the pre-login landing hero", () => {
    render(<HomePage />);

    expect(screen.getByRole("heading", { name: /MovieScore/i })).toBeInTheDocument();
    expect(screen.getByText(/decision engine for what to watch next/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /get early access/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /explore demo/i })).toBeInTheDocument();
  });

  it("shows expectation-vs-reality differentiators", () => {
    render(<HomePage />);

    expect(screen.getByText(/^before watch$/i)).toBeInTheDocument();
    expect(screen.getByText(/^after watch$/i)).toBeInTheDocument();
    expect(screen.getByText(/^delta intelligence$/i)).toBeInTheDocument();
  });
});
