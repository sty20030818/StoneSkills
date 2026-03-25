export function LoadingState({
  title = "正在准备界面",
  description = "框架层正在整理状态与系统信息。",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="feedback-state">
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}
