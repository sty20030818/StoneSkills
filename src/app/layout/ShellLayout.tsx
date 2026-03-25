import { Outlet } from "react-router-dom";
import { Sidebar } from "@/app/layout/Sidebar";
import { Topbar } from "@/app/layout/Topbar";
import { ToastViewport } from "@/components/ui/ToastViewport";

export function ShellLayout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="shell-main">
        <Topbar />
        <Outlet />
      </main>
      <ToastViewport />
    </div>
  );
}
