import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import HomePage from "./page";
import { getMe, refreshSession } from "../../lib/auth-api";

vi.mock("../../lib/auth-api", () => ({
  getMe: vi.fn(),
  refreshSession: vi.fn(),
  logout: vi.fn(),
}));

describe("Authenticated HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("greets the authenticated user by name", async () => {
    vi.mocked(getMe).mockResolvedValue({
      status: 200,
      data: {
        user: {
          userId: "u_1",
          email: "user@example.com",
          displayName: "Lucas",
          mfaEnabled: false,
        },
      },
    });

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText(/welcome back, lucas/i)).toBeInTheDocument();
    });
  });

  it("falls back to not-authenticated state when session cannot be refreshed", async () => {
    vi.mocked(getMe)
      .mockResolvedValueOnce({ status: 401, data: { error: "Not authenticated." } })
      .mockResolvedValueOnce({ status: 401, data: { error: "Not authenticated." } });
    vi.mocked(refreshSession).mockResolvedValue({
      status: 401,
      data: { error: "Invalid session." },
    });

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText(/you are not signed in/i)).toBeInTheDocument();
    });
  });
});
