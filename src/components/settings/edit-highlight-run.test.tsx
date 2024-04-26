import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EditHighlightRun } from "./edit-highlight-run";
import { renderWithProviders, trpcMsw } from "~/__test__/utils";
import { server } from "~/__test__/server";
import userEvent from "@testing-library/user-event";
import { http } from "msw";

describe("edit-highlight-run form", () => {
  server.use(
    http.get("/hello", () => {
      return new Response(JSON.stringify({ message: "hello" }), {
        status: 200,
      });
    }),
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
            id: 45458214,
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
          id: 11079920884,
          start_date: "2024-03-31T20:48:06Z",
          photo_count: 0,
          map: {
            id: "a11079920884",
            summary_polyline:
              "mpveF|uljVb@fF^jAhAdBPvAkAhToAzOeBtByA|@iErAyDj@{Ar@uBxA_BtBw@zAHhAaAtCe@`DSjD@vCMxBQ`Bg@zBk@z@eEtAm@?fBP|@w@pAg@`@a@Z{@f@aDNmD?_Db@_F`@yA\\k@RcAXu@ZYv@yDx@eAfAw@zDgBtAgBfDsG~@cIL{EQ{EOaOkDeh@{@mEiAiQq@yEAqA|AoCjCk@JS?[uBu[c@[mBXU[iBoYHy@YcAe@oHTg@lBOLO]yFFa@lFm@^_@Fk@YaEn@m@N@DNXrEIz@gGdLe@dB|Clc@dCv`@j@`Fr@rHb@jIJXd@A`A`A~@Sv@@|Ag@r@bAh@Xj@n@hHzD?p@_DjJc@hBP~@b@f@Or@~LxIFPk@rA_@GyLuIEUXsALGf@XzL|Ii@rAQBoM}IMJGt@]lAz@jCb@|BhAtHWt@o@b@e@x@y@`@s@|ECr@XhA]`CFjCTn@TvBEfAYbAmARyCvC_As@_AbAcBjAoBv@aHpAoAh@mCnBeC|DFpA_ApC]~BYtE?hCO|C_@jC]jAOXmAf@{Dz@nBHz@u@tAi@^]|@sFLgGLuCRgBd@qCz@mBj@g@^cCdA{BbG{Cv@y@lAoBfCcFv@cHLkE[oUuDoj@s@eDoAoRa@wAOyA@{AJUxAj@t@Q@[LIV^bAGHa@mCma@K]QKsBTY]gBmYF_AUg@i@iIN]bCc@_@sFHc@fFs@b@a@H]YoEv@u@HP\\rEIdAmGjL[~AlE|n@|@lOl@bIh@vE`AbONR`@?\\h@d@VpBSdBc@h@z@~AlA`HtDHTKp@}DhM@Nb@z@Q`AxKvHz@p@@Ng@hA[D_KeHeAaAX{A`@BfMzIDRi@jASBmMaJODGz@a@jAzAjFrAvI[z@g@\\k@~@{@d@q@`FVtB[`DHzA`@xAH`AGzBYn@gAJaDzC}@w@iAlAiCtAqC~@sC^cBf@sDdCaB`CIf@[ZHdAwA~E[fDCjGMrBMlAi@zBSf@e@\\}Al@[AoBd@hBPz@y@pBcA^mAb@aDNaGLyCZqC^wB`AsBf@a@ZyBx@oBpAcAtCqApAaAfDyFr@}ARaAj@_FNqCCiEWoJ@sEkC}`@k@aIs@_DGgAdDUpBl@xBj]`@pFVFpBU",
            polyline: "",
            resource_state: 2,
          },
          gear_id: "g14409393",
          start_latlng: [37.8, -122.46],
          end_latlng: [37.8, -122.46],
        },
      ];
    })
  );

  vi.mock("next/router", () => ({
    useRouter: vi.fn(),
  }));

  beforeEach(() => {
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

  it("import run", async () => {
    renderWithProviders(<EditHighlightRun highlightRun={null} />);
    const nameInput = screen.getByLabelText<HTMLInputElement>(/name/i);
    expect(nameInput.value).toBe("");

    const importBtn = screen.getByRole("button", {
      name: /import activity from strava/i,
    });
    fireEvent.click(importBtn);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/Foo Activity/)).toBeInTheDocument();

      const selectBtn = screen.getByRole("button", { name: /select/i });
      expect(selectBtn).toBeInTheDocument();
      fireEvent.click(selectBtn);

      expect(nameInput.value).toBe("Foo Activity");
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
