import { startDemoTask, writeTestLog } from "@/lib/tauri/commands";
import { normalizeCommandError } from "@/lib/tauri/errors";
import { useAppStore } from "@/stores/app-store";
import { PageScaffold } from "@/components/shared/PageScaffold";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";

export function DashboardPage() {
  const bootstrapStatus = useAppStore((state) => state.bootstrapStatus);
  const bootstrapPayload = useAppStore((state) => state.bootstrapPayload);
  const bootstrapError = useAppStore((state) => state.bootstrapError);
  const tasks = useAppStore((state) => state.tasks);
  const pushToast = useAppStore((state) => state.pushToast);

  const handleLogWrite = async () => {
    try {
      const result = await writeTestLog();
      pushToast({
        title: "日志测试成功",
        description: `已写入 ${result.logFilePath}`,
      });
    } catch (error) {
      const normalized = normalizeCommandError(error);
      pushToast({
        title: "日志写入失败",
        description: normalized.message,
      });
    }
  };

  const handleDemoTask = async () => {
    try {
      await startDemoTask();
    } catch (error) {
      const normalized = normalizeCommandError(error);
      pushToast({
        title: "演示任务启动失败",
        description: normalized.message,
      });
    }
  };

  return (
    <PageScaffold
      eyebrow="Foundation Dashboard"
      title="把桌面骨架先做硬，再让业务能力长出来。"
      description="这一页主要用于验证当前骨架是否具备启动、桥接、任务推送和日志能力。后续真实业务模块都会沿着这里的基础设施继续接入。"
      actions={
        <>
          <Button onClick={handleLogWrite}>写入测试日志</Button>
          <Button variant="secondary" onClick={handleDemoTask}>
            触发演示任务
          </Button>
        </>
      }
    >
      {bootstrapStatus === "loading" ? <LoadingState /> : null}
      {bootstrapStatus === "error" && bootstrapError ? (
        <ErrorState error={bootstrapError} />
      ) : null}
      <section className="grid-panels">
        <article className="panel-card panel-card--wide">
          <div className="panel-card__label">Bootstrap Snapshot</div>
          <div className="metric-strip">
            <div className="metric-box">
              <span>应用版本</span>
              <strong>{bootstrapPayload?.system.appVersion ?? "0.0.0"}</strong>
            </div>
            <div className="metric-box">
              <span>当前平台</span>
              <strong>{bootstrapPayload?.system.platformLabel ?? "待识别"}</strong>
            </div>
            <div className="metric-box">
              <span>建议仓库</span>
              <strong>{bootstrapPayload?.paths.suggestedRepositoryDir ? "就绪" : "待生成"}</strong>
            </div>
            <div className="metric-box">
              <span>任务总数</span>
              <strong>{Object.keys(tasks).length}</strong>
            </div>
          </div>
        </article>
        <article className="panel-card panel-card--narrow">
          <div className="panel-card__label">Diagnostic Rail</div>
          <div className="panel-list">
            <div className="panel-list__item">
              <div>
                <strong>应用数据目录</strong>
                <p>{bootstrapPayload?.paths.appDataDir ?? "待读取"}</p>
              </div>
              <span className="panel-list__tag">Path</span>
            </div>
            <div className="panel-list__item">
              <div>
                <strong>日志目录</strong>
                <p>{bootstrapPayload?.paths.appLogDir ?? "待读取"}</p>
              </div>
              <span className="panel-list__tag">Logs</span>
            </div>
            <div className="panel-list__item">
              <div>
                <strong>启动时间</strong>
                <p>{bootstrapPayload?.launchedAt ?? "待写入"}</p>
              </div>
              <span className="panel-list__tag">Boot</span>
            </div>
          </div>
        </article>
      </section>
    </PageScaffold>
  );
}
