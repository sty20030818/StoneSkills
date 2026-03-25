import { NavLink } from "react-router-dom";
import { NAV_ITEMS } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils/cn";

export function Sidebar() {
  return (
    <aside className="shell-sidebar">
      <div className="brand-mark">
        <div className="brand-mark__glyph">SS</div>
        <div className="brand-mark__title">
          <strong>StoneSkills</strong>
          <span>Developer Control Plane</span>
        </div>
      </div>
      <section className="sidebar-section">
        <div className="sidebar-caption">Primary Navigation</div>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn("nav-link", isActive && "is-active")}
          >
            <span className="nav-link__badge">{item.badge}</span>
            <span className="nav-link__meta">
              <strong>{item.label}</strong>
              <span>{item.description}</span>
            </span>
          </NavLink>
        ))}
      </section>
      <section className="sidebar-section">
        <div className="sidebar-caption">Foundational Layer</div>
        <div className="feedback-state">
          <strong>模块 1 正在落地</strong>
          <p>当前阶段优先完成应用壳层、桥接协议、状态中心和诊断入口。</p>
        </div>
      </section>
    </aside>
  );
}
