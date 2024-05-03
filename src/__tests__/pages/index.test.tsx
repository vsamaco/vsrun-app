import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import Home from "~/pages";

describe("home page", () => {
  afterEach(() => {
    vi.resetAllMocks();
    cleanup();
  });

  describe("with auth", () => {
    beforeEach(() => {
      vi.mock("next-auth/react", () => {
        const mockSession = {
          expires: new Date(Date.now() + 2 * 86400).toISOString(),
          user: { username: "admin" },
        };
        return {
          __esModule: true,
          useSession: vi.fn(() => {
            return { data: mockSession, status: "authenticated" };
          }),
        };
      });
    });
    it("renders page with manage profile", () => {
      const container = render(<Home />);
      expect(screen.getByText(/Manage Profile/)).toBeDefined();
      expect(container).toMatchSnapshot();
    });
  });

  // describe("no auth", () => {
  //   beforeEach(() => {
  //     vi.mock("next-auth/react", () => {
  //       return {
  //         __esModule: true,
  //         useSession: vi.fn(() => {
  //           return { data: {}, status: "unauthenticated" };
  //         }),
  //       };
  //     });
  //   });

  //   it("renders page with connect strava", () => {
  //     render(<Home />);
  //     expect(screen.getByRole("heading", { level: 1, name: "vsrun" }));
  //     expect(screen.getByAltText(/Connect with Strava/)).toBeDefined();
  //   });
  // });
});
