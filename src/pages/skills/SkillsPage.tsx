import { PageScaffold } from "@/components/shared/PageScaffold";
import { EmptyState } from "@/components/shared/EmptyState";

export function SkillsPage() {
  return (
    <PageScaffold
      eyebrow="Skill Governance"
      title="Skill 资产会先进入统一控制面，再去分发到目标工具。"
      description="这一页当前只保留结构占位，后续会接入搜索、筛选、详情入口和状态矩阵。"
    >
      <section className="grid-panels">
        <article className="panel-card panel-card--wide">
          <EmptyState
            title="列表层骨架已就绪"
            description="下一阶段会在这里接入搜索栏、过滤条件、表格视图和批量操作区。"
          />
        </article>
        <article className="panel-card panel-card--narrow">
          <div className="panel-card__label">Future Details</div>
          <div className="panel-list">
            <div className="panel-list__item">
              <div>
                <strong>来源筛选</strong>
                <p>GitHub、本地导入、扫描结果和在线仓库。</p>
              </div>
            </div>
            <div className="panel-list__item">
              <div>
                <strong>状态切片</strong>
                <p>启用状态、待更新状态、健康检查摘要。</p>
              </div>
            </div>
          </div>
        </article>
      </section>
    </PageScaffold>
  );
}
