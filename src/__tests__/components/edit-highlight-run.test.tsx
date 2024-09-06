import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders, trpcMsw } from "~/__tests__/utils";
import { server } from "~/__tests__/server";
import userEvent from "@testing-library/user-event";
import { EditHighlightRun } from "~/components/settings/edit-highlight-run";

describe("edit-highlight-run form", () => {
  beforeEach(() => {
    server.use(
      trpcMsw.activity.upsertProfileHighlightRun.mutation((input) => {
        return {
          id: "id",
          name: "name",
          slug: "slug",
          start_date: new Date(),
          workout_type: "",
          description: "",
          start_latlng: null,
          end_latlng: null,
          distance: 0,
          moving_time: 0,
          total_elevation_gain: 0,
          summary_polyline: null,
          laps: [],
          metadata: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          shoeId: "1",
          raceProfileId: "1",
          highlightRunProfileId: "1",
        };
      }),
      trpcMsw.strava.getActivities.query((_input) => {
        return [
          {
            athlete: {
              id: 2344567,
              resource_state: 1,
            },
            name: "Foo Activity",
            laps: [],
            distance: 27527.2,
            moving_time: 9946,
            elapsed_time: 10137,
            total_elevation_gain: 150,
            type: "Run",
            workout_type: 2,
            id: 123456789,
            start_date: "2024-03-31T20:48:06Z",
            photo_count: 0,
            map: {
              id: "a11079920884",
              summary_polyline: "",
              polyline: "",
              resource_state: 2,
            },
            gear_id: "gear_id",
            start_latlng: [37.8, -122.46],
            end_latlng: [37.8, -122.46],
          },
        ];
      }),
      trpcMsw.strava.getActivityById.query((_input) => {
        return {
          athlete: {
            id: 2344567,
            resource_state: 1,
          },
          name: "Foo Search Activity",
          laps: [],
          distance: 27527.2,
          moving_time: 9946,
          elapsed_time: 10137,
          total_elevation_gain: 150,
          type: "Run",
          workout_type: 2,
          id: 123456789,
          start_date: "2024-03-31T20:48:06Z",
          photo_count: 0,
          map: {
            id: "a11079920884",
            summary_polyline: "",
            polyline: "",
            resource_state: 2,
          },
          gear_id: "gear_id",
          start_latlng: [37.8, -122.46],
          end_latlng: [37.8, -122.46],
        };
      })
    );
    vi.mock("next/router", () => ({
      useRouter: vi.fn(),
    }));
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("empty form", () => {
    renderWithProviders(<EditHighlightRun highlightRun={null} />);
    expect(screen.getByLabelText(/name/i)).toBeDefined();
    expect(screen.getByLabelText(/description/i)).toBeDefined();
    // expect(screen.getByLabelText(/moving_time_hms/i)).toBeDefined();
    expect(screen.getByLabelText(/elevation/i)).toBeDefined();
    expect(screen.getByLabelText(/distance/i)).toBeDefined();
  });

  it("runs validation", async () => {
    renderWithProviders(<EditHighlightRun highlightRun={null} />);
    const submitBtn = screen.getByRole("button", { name: /save changes/i });
    await userEvent.click(submitBtn);
    expect(
      screen.getByText("String must contain at least 1 character(s)")
    ).toBeDefined();
  });

  it("import run with browse", async () => {
    renderWithProviders(<EditHighlightRun highlightRun={null} />);
    const nameInput = screen.getByLabelText<HTMLInputElement>(/name/i);
    expect(nameInput.value).toBe("");

    const importBtn = screen.getByRole("button", {
      name: /import activity from strava/i,
    });
    fireEvent.click(importBtn);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    const browseBtn = screen.getByRole("button", {
      name: /browse/i,
    });
    fireEvent.click(browseBtn);

    await waitFor(() => {
      expect(screen.getByText(/Foo Activity/)).toBeInTheDocument();

      const selectBtn = screen.getByRole("button", { name: /select/i });
      expect(selectBtn).toBeInTheDocument();
      fireEvent.click(selectBtn);

      expect(nameInput.value).toBe("Foo Activity");
    });
  });

  it("import run with search", async () => {
    renderWithProviders(<EditHighlightRun highlightRun={null} />);
    const nameInput = screen.getByLabelText<HTMLInputElement>(/name/i);
    expect(nameInput.value).toBe("");

    const importBtn = screen.getByRole("button", {
      name: /import activity from strava/i,
    });
    fireEvent.click(importBtn);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    const stravaUrlInput =
      screen.getByLabelText<HTMLInputElement>(/strava url/i);
    await userEvent.type(
      stravaUrlInput,
      "https://www.strava.com/activities/123"
    );

    const searchBtn = screen.getByRole("button", {
      name: /search/i,
    });
    fireEvent.click(searchBtn);

    await waitFor(() => {
      expect(screen.getByText(/Foo Search Activity/)).toBeInTheDocument();
      const selectBtn = screen.getByRole("button", { name: /select/i });
      expect(selectBtn).toBeInTheDocument();
      fireEvent.click(selectBtn);
      expect(nameInput.value).toBe("Foo Search Activity");
    });
  });

  it("renders defaults", () => {
    const highlightRun = {
      id: "id",
      name: "name",
      slug: "slug",
      start_date: new Date(),
      workout_type: "",
      description: "",
      start_latlng: null,
      end_latlng: null,
      distance: 0,
      moving_time: 0,
      total_elevation_gain: 0,
      summary_polyline: null,
      laps: [],
      metadata: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      shoeId: "1",
      raceProfileId: "1",
      highlightRunProfileId: "1",
    };
    renderWithProviders(<EditHighlightRun highlightRun={highlightRun} />);

    const nameInput = screen.getByLabelText<HTMLInputElement>(/name/i);
    expect(nameInput.value).toEqual("name");
  });

  it("submit valid changes", async () => {
    const highlightRun = {
      id: "id",
      name: "name",
      slug: "slug",
      start_date: new Date(),
      workout_type: "",
      description: "",
      start_latlng: null,
      end_latlng: null,
      distance: 1600,
      moving_time: 3600,
      total_elevation_gain: 0,
      summary_polyline: null,
      laps: [],
      metadata: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      shoeId: "1",
      raceProfileId: "1",
      highlightRunProfileId: "1",
    };

    vi.mock("next/router", () => ({
      useRouter: () => ({
        push: vi.fn(),
      }),
    }));

    const requestSpy = vi.fn();
    requestSpy.mockReturnValueOnce({ method: "POST" });
    server.events.on("request:start", requestSpy);
    server.events.on("request:start", ({ request, requestId }) => {
      console.log("Outgoing request:", request.method, request.url);
    });
    server.events.on("response:mocked", ({ request, requestId, response }) => {
      console.log(
        "%s %s received %s %s",
        request.method,
        request.url,
        response.status,
        response.statusText
      );
    });

    renderWithProviders(<EditHighlightRun highlightRun={highlightRun} />);
    const nameInput = screen.getByLabelText<HTMLInputElement>(/name/i);

    await userEvent.type(nameInput, "Bar Name");

    const submitBtn = screen.getByRole("button", { name: /save changes/i });
    await userEvent.click(submitBtn);

    // console.log({ requestSpy: requestSpy });
    expect(requestSpy).toHaveBeenCalledOnce();
  });
});
