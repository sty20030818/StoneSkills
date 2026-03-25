import { PageScaffold } from "@/components/shared/PageScaffold";
import { useAppStore } from "@/stores/app-store";

export function TargetsPage() {
  const platform = useAppStore((state) => state.currentPlatform);
  const detectedTargets = useAppStore((state) => state.detectedTargets);

  return (
    <PageScaffold
      eyebrow="Target Matrix"
      title="同一套 Skill，最终要落到哪些 AI 工具上，这里就是控制面。"
      description="本页当前用于验证平台摘要和目标工具占位结构。后续会扩展为适配状态、安装路径、启用方式和错误诊断面板。"
    >
      <section className="grid-panels">
        <article className="panel-card panel-card--wide">
          <div className="panel-card__label">Platform Summary</div>
          <div className="metric-strip">
            <div className="metric-box">
              <span>当前平台</span>
              <strong>{platform ?? "待识别"}</strong>
            </div>
            <div className="metric-box">
              <span>目标工具</span>
              <strong>{detectedTargets.length}</strong>
            </div>
          </div>
        </article>
        <article className="panel-card panel-card--narrow">
          <div className="panel-card__label">Target Placeholders</div>
          <div className="panel-list">
            {detectedTargets.map((target) => (
              <div key={target.id} className="panel-list__item">
                <div>
                  <strong>{target.label}</strong>
                  <p>状态：{target.status}</p>
                </div>
                <span className="panel-list__tag">{target.id}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </PageScaffold>
  );
}
