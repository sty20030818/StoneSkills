import type { CommandError } from "@/lib/tauri/contracts";
import { Button } from "@/components/ui/Button";

export function ErrorState({
  title = "出现可恢复异常",
  error,
  onRetry,
}: {
  title?: string;
  error: CommandError;
  onRetry?: () => void;
}) {
  return (
    <div className="feedback-state">
      <strong>{title}</strong>
      <p>{error.message}</p>
      {error.details ? <p>{error.details}</p> : null}
      {onRetry ? <Button onClick={onRetry}>重新尝试</Button> : null}
    </div>
  );
}
