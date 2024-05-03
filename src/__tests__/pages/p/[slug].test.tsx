import { type DehydratedState } from "@tanstack/react-query";
import { cleanup, waitFor, screen } from "@testing-library/react";
import { type ResponsiveContainerProps } from "recharts";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { server } from "~/__tests__/server";
import { renderWithProviders, trpcMsw } from "~/__tests__/utils";
import RunProfilePage from "~/pages/p/[slug]";

describe("profile", () => {
  beforeEach(() => {
    vi.mock("~/server/db", () => ({
      prisma: vi.fn(),
    }));
    vi.mock("~/server/auth", () => ({
      getServerAuthSession: vi.fn(),
    }));

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

    vi.mock("~/contexts/useProfile", () => {
      return {
        __esModule: true,
        useProfile: vi.fn(() => {
          return {
            profile: {
              name: "foobar",
              slug: "foobar",
            },
            setProfile: vi.fn(),
          };
        }),
      };
    });

    window.IntersectionObserver = vi.fn(() => {
      return {
        root: null,
        rootMargin: "",
        thresholds: [],
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
        takeRecords: vi.fn(),
      };
    });

    vi.mock("recharts", async () => {
      const OriginalRechartsModule = await vi.importActual("recharts");
      return {
        ...OriginalRechartsModule,
        ResponsiveContainer: ({
          height,
          children,
        }: ResponsiveContainerProps) => (
          <div
            className="recharts-responsive-container"
            style={{ width: 800, height }}
          >
            {children}
          </div>
        ),
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
        trpcMsw.runProfile.getProfileBySlug.query((_input) => {
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

    it("render profile with data", async () => {
      const container = renderWithProviders(
        <RunProfilePage slug={"foobar"} trpcState={{} as DehydratedState} />
      );
      await waitFor(() => {
        expect(screen.getByRole("heading", { name: /foobar/ })).toBeDefined();
      });
      expect(container).toMatchSnapshot();
    });
  });
});
