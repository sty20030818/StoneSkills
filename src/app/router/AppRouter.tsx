import { Navigate, Route, Routes } from "react-router-dom";
import { ShellLayout } from "@/app/layout/ShellLayout";
import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { SkillsPage } from "@/pages/skills/SkillsPage";
import { InstallPage } from "@/pages/install/InstallPage";
import { TargetsPage } from "@/pages/targets/TargetsPage";
import { UpdatesPage } from "@/pages/updates/UpdatesPage";
import { SettingsPage } from "@/pages/settings/SettingsPage";

export function AppRouter() {
  return (
    <Routes>
      <Route
        element={<ShellLayout />}
      >
        <Route
          index
          element={<Navigate to="/dashboard" replace />}
        />
        <Route
          path="/dashboard"
          element={<DashboardPage />}
        />
        <Route
          path="/skills"
          element={<SkillsPage />}
        />
        <Route
          path="/install"
          element={<InstallPage />}
        />
        <Route
          path="/targets"
          element={<TargetsPage />}
        />
        <Route
          path="/updates"
          element={<UpdatesPage />}
        />
        <Route
          path="/settings"
          element={<SettingsPage />}
        />
      </Route>
    </Routes>
  );
}
