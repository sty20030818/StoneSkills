# StoneSkills

StoneSkills 是一个基于 `Tauri 2 + React + TypeScript + Rust` 的桌面应用，用来统一管理多个 AI 工具的 Skills。

当前仓库已完成模块 1 的基础骨架搭建，重点是：

- 应用壳层与一级导航
- React / Rust command 通道
- Tauri event 长任务桥接
- Zustand 状态切片骨架
- 基础错误处理与日志入口
- Tailwind CSS v4 + shadcn/ui 前端基线
- OXC lint / format 与 Vitest 测试基线

## 目录约定

### 前端

- `src/app`：应用级入口、布局、Provider、路由
- `src/pages`：一级页面承载
- `src/components`：共享 UI 和通用反馈组件
- `src/stores`：Zustand 主 store 与 slices
- `src/lib/tauri`：前后端桥接契约、命令封装、事件封装
- `src/test`：Vitest 测试 setup 与前端基础测试样例

## 前端基线

- 样式体系：`Tailwind CSS v4`
- 组件基线：`shadcn/ui`
- 代码质量：`oxlint + oxfmt`
- 单元测试：`Vitest + Testing Library + jsdom`

当前前端壳层已经切换到 `Tailwind + shadcn` 体系，`src/index.css` 主要承担主题 token、基础层和 Tailwind 入口职责，不再继续承载大面积组件级手写样式。

### Rust / Tauri

- `src-tauri/src/app`：Builder、全局状态、错误、事件
- `src-tauri/src/commands`：IPC 命令边界
- `src-tauri/src/services`：系统路径、日志、文件等基础服务
- `src-tauri/src/platform`：macOS / Windows 平台差异抽象
- `src-tauri/src/models`：DTO 与统一返回模型

## Command / Event 约定

### Commands

- `bootstrap_app`：读取应用启动快照
- `get_system_info`：读取平台和版本信息
- `get_app_paths`：读取应用目录、日志目录、建议仓库目录
- `write_test_log`：写入测试日志
- `start_demo_task`：触发演示任务，验证 event 链路

### Events

- `app:ready`
- `task:progress`
- `task:completed`
- `task:failed`

## Zustand 状态切片

- `bootstrap`：应用启动状态
- `app-shell`：Shell UI 与 toast
- `task-center`：长任务摘要
- `repository`：仓库路径摘要
- `target-detection`：目标工具检测摘要

## 开发命令

```bash
bun install
bun run check
bun run format
bun run format:check
bun run lint
bun run test
bun run test:run
bun run coverage
bun run build
bun run tauri:dev
```

## 当前限制

- Windows smoke test 还没有在实际 Windows 环境执行
- 当前图标为最小占位资源，后续需要替换为正式图标
- 模块 1 只实现基础骨架，不包含真实的 Skill 安装、扫描、更新与分发逻辑
