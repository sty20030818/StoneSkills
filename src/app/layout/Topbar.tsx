import { useLocation } from "react-router-dom";
import { NAV_ITEMS } from "@/lib/constants/navigation";
import { useAppStore } from "@/stores/app-store";

export function Topbar() {
  const location = useLocation();
  const bootstrapStatus = useAppStore((state) => state.bootstrapStatus);
  const bootstrapPayload = useAppStore((state) => state.bootstrapPayload);
  const tasks = useAppStore((state) => state.tasks);

  const matched =
    NAV_ITEMS.find((item) => location.pathname.startsWith(item.to)) ?? NAV_ITEMS[0];
  const runningTasks = Object.values(tasks).filter(
    (task) => task.status === "queued" || task.status === "running",
  ).length;

  return (
    <header className="shell-topbar">
      <div className="topbar-title">
        <small>Application Shell</small>
        <strong>{matched.label}</strong>
      </div>
      <div className="topbar-cluster">
        <div
          className="status-pill"
          data-tone={bootstrapStatus === "ready" ? "accent" : "neutral"}
        >
          <span className="status-pill__dot" />
          启动态：{bootstrapStatus}
        </div>
        <div className="status-pill" data-tone="neutral">
          <span className="status-pill__dot" />
          平台：{bootstrapPayload?.system.platformLabel ?? "待识别"}
        </div>
        <div className="command-bar">
          <span className="command-bar__prompt">task</span>
          <strong>{runningTasks > 0 ? `进行中 ${runningTasks}` : "当前无长任务"}</strong>
        </div>
      </div>
    </header>
  );
}
