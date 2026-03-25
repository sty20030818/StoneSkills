import { PageScaffold } from "@/components/shared/PageScaffold";
import { EmptyState } from "@/components/shared/EmptyState";

export function InstallPage() {
  return (
    <PageScaffold
      eyebrow="Import Channels"
      title="安装入口只有一个，但来源和后续动作会被统一编排。"
      description="这里会承接 GitHub 安装、本地导入和扫描导入三条路径。当前先把页面骨架和信息层级固定下来。"
    >
      <section className="grid-panels">
        <article className="panel-card panel-card--wide">
          <EmptyState
            title="安装向导待接入"
            description="下一阶段会把元数据预览、冲突提示、安装方式和立即启用入口放在这里。"
          />
        </article>
        <article className="panel-card panel-card--narrow">
          <div className="panel-card__label">Flow Notes</div>
          <div className="panel-list">
            <div className="panel-list__item">
              <div>
                <strong>GitHub</strong>
                <p>仓库解析、结构识别、版本绑定。</p>
              </div>
            </div>
            <div className="panel-list__item">
              <div>
                <strong>本地目录</strong>
                <p>复制或引用原目录，必要时补齐最小元数据。</p>
              </div>
            </div>
            <div className="panel-list__item">
              <div>
                <strong>扫描导入</strong>
                <p>常见目录与自定义路径统一纳入确认流。</p>
              </div>
            </div>
          </div>
        </article>
      </section>
    </PageScaffold>
  );
}
