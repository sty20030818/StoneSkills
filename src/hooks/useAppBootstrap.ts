import { useEffect, useRef } from "react";
import { bootstrapApp } from "@/lib/tauri/commands";
import { normalizeCommandError } from "@/lib/tauri/errors";
import { useAppStore } from "@/stores/app-store";

export function useAppBootstrap() {
  const hasRunRef = useRef(false);
  const setBootstrapLoading = useAppStore((state) => state.setBootstrapLoading);
  const setBootstrapReady = useAppStore((state) => state.setBootstrapReady);
  const setBootstrapNeedsSetup = useAppStore(
    (state) => state.setBootstrapNeedsSetup,
  );
  const setBootstrapError = useAppStore((state) => state.setBootstrapError);
  const setRepositoryRoots = useAppStore((state) => state.setRepositoryRoots);
  const setTargetSummary = useAppStore((state) => state.setTargetSummary);
  const pushToast = useAppStore((state) => state.pushToast);

  useEffect(() => {
    if (hasRunRef.current) {
      return;
    }

    hasRunRef.current = true;

    const run = async () => {
      try {
        setBootstrapLoading();
        const payload = await bootstrapApp();

        setRepositoryRoots({
          repositoryRoot: null,
          suggestedRepositoryRoot: payload.paths.suggestedRepositoryDir,
        });
        setTargetSummary({
          currentPlatform: payload.system.platformLabel,
          detectedTargets: [
            { id: "cursor", label: "Cursor", status: "unknown" },
            { id: "codex", label: "Codex", status: "connected" },
            { id: "claude-code", label: "Claude Code", status: "unknown" },
          ],
        });

        if (payload.paths.suggestedRepositoryDir.length === 0) {
          setBootstrapNeedsSetup(payload);
          return;
        }

        setBootstrapReady(payload);
      } catch (error) {
        const normalized = normalizeCommandError(error);
        setBootstrapError(normalized);
        pushToast({
          title: "应用启动检查失败",
          description: normalized.message,
        });
      }
    };

    void run();
  }, [
    pushToast,
    setBootstrapError,
    setBootstrapLoading,
    setBootstrapNeedsSetup,
    setBootstrapReady,
    setRepositoryRoots,
    setTargetSummary,
  ]);
}
