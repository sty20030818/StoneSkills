import { PageScaffold } from "@/components/shared/PageScaffold";
import { EmptyState } from "@/components/shared/EmptyState";

export function UpdatesPage() {
  return (
    <PageScaffold
      eyebrow="Update Rail"
      title="更新会是独立工作流，所以这里先留出批量处理和版本摘要位。"
      description="模块 1 只需要把页面骨架和状态承载能力准备好，真正的版本检测与回滚会在后续模块接入。"
    >
      <section className="grid-panels">
        <article className="panel-card panel-card--wide">
          <EmptyState
            title="更新列表尚未接线"
            description="稍后会接入待更新清单、版本差异摘要和批量更新入口。"
          />
        </article>
        <article className="panel-card panel-card--narrow">
          <div className="panel-card__label">Guardrails</div>
          <div className="panel-list">
            <div className="panel-list__item">
              <div>
                <strong>先备份后更新</strong>
                <p>所有高风险覆盖动作都要可回滚。</p>
              </div>
            </div>
            <div className="panel-list__item">
              <div>
                <strong>任务中心复用</strong>
                <p>批量更新直接复用当前 event + task center 架构。</p>
              </div>
            </div>
          </div>
        </article>
      </section>
    </PageScaffold>
  );
}
