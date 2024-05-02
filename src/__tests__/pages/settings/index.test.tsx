import { cleanup, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { server } from "~/__tests__/server";
import { renderWithProviders, trpcMsw } from "~/__tests__/utils";
import GeneralSettingsPage from "~/pages/settings";

describe("settings", () => {
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

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  describe("with runprofile", () => {
    beforeEach(() => {
      server.use(
        trpcMsw.runProfile.getUserProfile.query((_input) => {
          return {
            id: "123",
            userId: "456",
            name: "Foo Bar",
            slug: "foobar",
            shoeRotations: [
              {
                id: "shoe-rotation-id",
                slug: "rotation-slug",
                name: "Foobar Rotation",
                description: "",
                startDate: new Date("2024-05-01T12:00:00Z"),
                shoes: [],
                shoeList: [],
                metadata: null,
                updatedAt: new Date("2024-05-01T12:00:00Z"),
                createdAt: new Date("2024-05-01T12:00:00Z"),
                profileId: "1",
              },
            ],
            shoes2: [
              {
                id: "shoe-id",
                slug: "foobar-shoe",
                brand_name: "brand",
                model_name: "model",
                description: "",
                distance: 1600,
                start_date: new Date("2024-05-01T12:00:00Z"),
                categories: ["daily-trainer"],
                metadata: null,
                runProfileId: "1",
                updatedAt: new Date("2024-05-01T12:00:00Z"),
                createdAt: new Date("2024-05-01T12:00:00Z"),
              },
            ],
            user: {
              accounts: [{ provider: "strava", providerAccountId: "123" }],
            },
            races: [
              {
                id: "123",
                name: "foobar race",
                slug: "foobar-race",
                description: "",
                start_date: new Date("2024-05-01T12:00:00Z"),
                start_latlng: [1, 1],
                end_latlng: null,
                workout_type: null,
                distance: 1600,
                moving_time: 3600,
                total_elevation_gain: 0,
                laps: [],
                summary_polyline: "",
                shoeId: null,
                metadata: null,
                raceProfileId: null,
                highlightRunProfileId: "1",
                createdAt: new Date("2024-05-01T12:00:00Z"),
                updatedAt: new Date("2024-05-01T12:00:00Z"),
              },
            ],
            highlight_run: {
              id: "123",
              name: "foobar run",
              slug: "foobar-run",
              description: "",
              start_date: new Date("2024-05-01T12:00:00Z"),
              start_latlng: [1, 1],
              end_latlng: null,
              workout_type: null,
              distance: 1600,
              moving_time: 3600,
              total_elevation_gain: 0,
              laps: [],
              summary_polyline: "",
              shoeId: null,
              metadata: null,
              raceProfileId: null,
              highlightRunProfileId: "1",
              createdAt: new Date("2024-05-01T12:00:00Z"),
              updatedAt: new Date("2024-05-01T12:00:00Z"),
            },
            weekStats: {
              start_date: new Date("2024-05-01T12:00:00Z"),
              end_date: new Date("2024-05-01T12:00:00Z"),
              total_runs: 1,
              total_duration: 3600,
              total_distance: 1600,
              total_elevation: 0,
              activities: [],
              metadata: null,
            },
            events: [],
            highlightRun: {},
            shoes: [],
            createdAt: new Date("2024-05-01T12:00:00Z"),
            updatedAt: new Date("2024-05-01T12:00:00Z"),
          };
        })
      );
    });

    it("renders page with profile", async () => {
      const container = renderWithProviders(<GeneralSettingsPage />);
      await waitFor(() => {
        expect(screen.getByRole("heading", { name: /foo bar/i })).toBeDefined();

        const highlightRunCard = screen.getByTestId(
          "settings-highlight-run-card"
        );
        expect(
          within(highlightRunCard).getByRole("heading", { name: /run/i })
        ).toBeDefined();
        expect(within(highlightRunCard).getByText(/foobar run/i)).toBeDefined();

        const weekStatsCard = screen.getByTestId("settings-weekstats-card");
        expect(
          within(weekStatsCard).getByRole("heading", { name: /week/i })
        ).toBeDefined();
        expect(within(weekStatsCard).getByText(/1h 0m/)).toBeDefined();

        const shoesCard = screen.getByTestId("settings-shoes-card");
        expect(
          within(shoesCard).getByRole("heading", { name: /shoes/i })
        ).toBeDefined();
        expect(within(shoesCard).getByText(/brand model/i)).toBeDefined();

        const shoeRotationsCard = screen.getByTestId(
          "settings-shoe-rotations-card"
        );
        expect(
          within(shoeRotationsCard).getByRole("heading", {
            name: /shoe rotations/i,
          })
        ).toBeDefined();
        expect(
          within(shoeRotationsCard).getByText(/foobar rotation/i)
        ).toBeDefined();

        const racesCard = screen.getByTestId("settings-races-card");
        expect(
          within(racesCard).getByRole("heading", { name: /races/i })
        ).toBeDefined();
        expect(within(racesCard).getByText(/foobar race/)).toBeDefined();
      });
      expect(container).toMatchSnapshot();
    });
  });

  describe("without runprofile", () => {
    beforeEach(() => {
      server.use(
        trpcMsw.runProfile.getUserProfile.query((_input) => {
          return null;
        })
      );
    });

    it("renders placeholder create profile", async () => {
      const container = renderWithProviders(<GeneralSettingsPage />);
      await waitFor(() => {
        expect(
          container.getByText(/You don't have a profile yet/)
        ).toBeDefined();
        expect(
          container.getByRole("button", { name: "Create Profile" })
        ).toBeDefined();
      });
    });
  });
});
