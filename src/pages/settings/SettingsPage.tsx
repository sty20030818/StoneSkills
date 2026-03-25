import { useState } from "react";
import { PageScaffold } from "@/components/shared/PageScaffold";
import { Button } from "@/components/ui/Button";
import { DialogShell } from "@/components/ui/DialogShell";
import { useAppStore } from "@/stores/app-store";

export function SettingsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const suggestedRepositoryRoot = useAppStore(
    (state) => state.suggestedRepositoryRoot,
  );

  return (
    <PageScaffold
      eyebrow="System Preferences"
      title="先把路径、日志和系统级开关的容器打好，再往里接真实设置项。"
      description="当前设置页主要验证 Dialog、状态读取和诊断入口占位。"
      actions={
        <Button variant="secondary" onClick={() => setDialogOpen(true)}>
          打开确认弹窗
        </Button>
      }
    >
      <section className="grid-panels">
        <article className="panel-card panel-card--wide">
          <div className="panel-card__label">Environment Defaults</div>
          <div className="panel-list">
            <div className="panel-list__item">
              <div>
                <strong>建议仓库路径</strong>
                <p>{suggestedRepositoryRoot ?? "待生成"}</p>
              </div>
              <span className="panel-list__tag">Repo</span>
            </div>
            <div className="panel-list__item">
              <div>
                <strong>日志入口</strong>
                <p>当前阶段已打通文件日志写入能力，后续可以扩展为日志查看器。</p>
              </div>
              <span className="panel-list__tag">Logs</span>
            </div>
          </div>
        </article>
        <article className="panel-card panel-card--narrow">
          <div className="panel-card__label">Reserved Slots</div>
          <div className="panel-list">
            <div className="panel-list__item">
              <div>
                <strong>默认安装方式</strong>
                <p>link / copy 策略预留。</p>
              </div>
            </div>
            <div className="panel-list__item">
              <div>
                <strong>自动检测开关</strong>
                <p>目标工具与更新检测策略预留。</p>
              </div>
            </div>
          </div>
        </article>
      </section>
      <DialogShell
        open={dialogOpen}
        title="确认弹窗骨架"
        description="这个对话框用于占位验证危险操作确认流。后续删除、覆盖和批量更新都会复用它。"
        onCancel={() => setDialogOpen(false)}
        onConfirm={() => setDialogOpen(false)}
      />
    </PageScaffold>
  );
}
