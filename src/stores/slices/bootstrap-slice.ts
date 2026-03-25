import type { BootstrapPayload, CommandError } from "@/lib/tauri/contracts";

export type BootstrapStatus =
  | "idle"
  | "loading"
  | "ready"
  | "needs-setup"
  | "error";

export interface BootstrapSlice {
  bootstrapStatus: BootstrapStatus;
  bootstrapPayload: BootstrapPayload | null;
  bootstrapError: CommandError | null;
  setBootstrapLoading: () => void;
  setBootstrapReady: (payload: BootstrapPayload) => void;
  setBootstrapNeedsSetup: (payload: BootstrapPayload) => void;
  setBootstrapError: (error: CommandError) => void;
}

export const createBootstrapSlice = (set: SetStore<BootstrapSlice>) => ({
  bootstrapStatus: "idle" as BootstrapStatus,
  bootstrapPayload: null as BootstrapPayload | null,
  bootstrapError: null as CommandError | null,
  setBootstrapLoading: () =>
    set({
      bootstrapStatus: "loading",
      bootstrapError: null,
    }),
  setBootstrapReady: (payload: BootstrapPayload) =>
    set({
      bootstrapStatus: "ready",
      bootstrapPayload: payload,
      bootstrapError: null,
    }),
  setBootstrapNeedsSetup: (payload: BootstrapPayload) =>
    set({
      bootstrapStatus: "needs-setup",
      bootstrapPayload: payload,
      bootstrapError: null,
    }),
  setBootstrapError: (error: CommandError) =>
    set({
      bootstrapStatus: "error",
      bootstrapError: error,
    }),
});
