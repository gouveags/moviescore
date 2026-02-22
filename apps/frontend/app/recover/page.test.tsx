import React from "react";
import { render, screen } from "@testing-library/react";
import RecoverPage from "./page";

describe("RecoverPage", () => {
  it("renders request and reset forms", () => {
    render(<RecoverPage />);

    expect(screen.getByRole("heading", { name: /recover account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/account email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/recovery token/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send recovery email/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /set new password/i })).toBeInTheDocument();
  });
});
