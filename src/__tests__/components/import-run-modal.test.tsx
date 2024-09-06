import {
  cleanup,
  fireEvent,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders, trpcMsw } from "../utils";
import { server } from "~/__tests__/server";
import userEvent from "@testing-library/user-event";
import ImportRunModal from "~/components/settings/import-run-modal";
import { FormProvider, useForm } from "react-hook-form";
import { type RaceActivity } from "~/types";
import { stravaActivityFixture } from "../fixtures/strava";

type FormValues = {
  highlightRun: Omit<RaceActivity, "id" | "slug">;
};

describe("import-run-modal", () => {
  beforeEach(() => {
    vi.mock("next/router", () => ({
      useRouter: vi.fn(),
    }));
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("import run with browse", async () => {
    server.use(
      trpcMsw.strava.getActivities.query((_input) => {
        return [stravaActivityFixture];
      })
    );
    const { result } = renderHook(() => useForm<FormValues>());
    const formMethods = result.current;

    renderWithProviders(
      <FormProvider {...formMethods}>
        <ImportRunModal setSelectedActivity={() => null} />
      </FormProvider>
    );

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
    });
  });

  it("import run with search", async () => {
    server.use(
      trpcMsw.strava.getActivityById.query((_input) => {
        return stravaActivityFixture;
      })
    );
    const { result } = renderHook(() => useForm<FormValues>());
    const formMethods = result.current;

    renderWithProviders(
      <FormProvider {...formMethods}>
        <ImportRunModal setSelectedActivity={() => null} />
      </FormProvider>
    );

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
      expect(screen.getByText(/Foo Activity/)).toBeInTheDocument();
      const selectBtn = screen.getByRole("button", { name: /select/i });
      expect(selectBtn).toBeInTheDocument();
    });
  });

  it("invalid strava url", async () => {
    const { result } = renderHook(() => useForm<FormValues>());
    const formMethods = result.current;

    renderWithProviders(
      <FormProvider {...formMethods}>
        <ImportRunModal setSelectedActivity={() => null} />
      </FormProvider>
    );

    const importBtn = screen.getByRole("button", {
      name: /import activity from strava/i,
    });
    fireEvent.click(importBtn);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    const stravaUrlInput =
      screen.getByLabelText<HTMLInputElement>(/strava url/i);
    await userEvent.type(stravaUrlInput, "123");

    const searchBtn = screen.getByRole("button", {
      name: /search/i,
    });
    fireEvent.click(searchBtn);

    expect(screen.getByText(/invalid strava url/i)).toBeInTheDocument();
  });

  it("activity not found", async () => {
    server.use(
      trpcMsw.strava.getActivityById.query((_input) => {
        return null;
      })
    );

    const { result } = renderHook(() => useForm<FormValues>());
    const formMethods = result.current;

    renderWithProviders(
      <FormProvider {...formMethods}>
        <ImportRunModal setSelectedActivity={() => null} />
      </FormProvider>
    );

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
      expect(screen.getByText(/activity not found/i)).toBeInTheDocument();
    });
  });
});
