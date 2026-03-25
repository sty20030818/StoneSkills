export const NAV_ITEMS = [
  {
    to: "/dashboard",
    label: "总览",
    description: "项目启动与诊断总览",
    badge: "OV",
  },
  {
    to: "/skills",
    label: "我的 Skills",
    description: "收录、搜索与治理入口",
    badge: "SK",
  },
  {
    to: "/install",
    label: "安装 / 导入",
    description: "GitHub、本地与扫描入口",
    badge: "IN",
  },
  {
    to: "/targets",
    label: "AI 工具",
    description: "目标工具与适配矩阵",
    badge: "TG",
  },
  {
    to: "/updates",
    label: "更新中心",
    description: "待更新与版本摘要",
    badge: "UP",
  },
  {
    to: "/settings",
    label: "设置",
    description: "日志、路径与系统偏好",
    badge: "ST",
  },
] as const;
