import { BrowserRouter } from "react-router-dom";
import { AppRouter } from "@/app/router/AppRouter";
import { AppErrorBoundary } from "@/components/shared/AppErrorBoundary";
import { useAppBootstrap } from "@/hooks/useAppBootstrap";
import { useTaskEventBridge } from "@/hooks/useTaskEventBridge";

function AppRuntime() {
  useAppBootstrap();
  useTaskEventBridge();

  return <AppRouter />;
}

export function AppProviders() {
  return (
    <AppErrorBoundary>
      <BrowserRouter>
        <AppRuntime />
      </BrowserRouter>
    </AppErrorBoundary>
  );
}
