# Local LLM Deployer 实施计划

- [ ] 1. 初始化 Tauri 2.0 + React 项目结构
  - 创建 Tauri 项目，配置 Cargo.toml 依赖（sysinfo, nvml, reqwest, tokio, serde 等）
  - 配置 Vite + React + TypeScript 前端
  - 配置 Tailwind CSS 样式方案
  - 设置 Zustand 状态管理
  - 配置 i18next 国际化

- [ ] 2. 实现 Rust 后端核心数据模型
  - [ ] 2.1 创建数据模型结构体（SystemConfig, CpuInfo, GpuInfo, MemoryInfo, DiskInfo）
  - [ ] 2.2 创建 Ollama 相关模型（OllamaStatus, ModelInfo, ApiInfo, Endpoint, VerifyResult）
  - [ ] 2.3 创建监控相关模型（ResourceUsage, ModelStatus）
  - [ ] 2.4 创建配置模型（AppConfig, ModelSource）
  - [ ] 2.5 实现数据序列化和反序列化（serde）

- [ ] 3. 实现系统配置检测模块（system.rs）
  - [ ] 3.1 实现 detect_cpu() - CPU 型号、核心数、频率检测
  - [ ] 3.2 实现 detect_gpu() - GPU 型号、显存、驱动版本检测（nvml）
  - [ ] 3.3 实现 detect_memory() - 物理内存总量和可用内存检测
  - [ ] 3.4 实现 detect_disk() - 磁盘空间和挂载点检测
  - [ ] 3.5 实现 detect_system_config() Tauri Command

- [ ] 4. 实现 Ollama 管理模块（ollama.rs）
  - [ ] 4.1 实现 Ollama 安装检测和自动安装
  - [ ] 4.2 实现 start_ollama() - 启动 Ollama 服务
  - [ ] 4.3 实现 stop_ollama() - 停止 Ollama 服务
  - [ ] 4.4 实现 get_ollama_status() - 获取 Ollama 运行状态和版本
  - [ ] 4.5 实现 is_ollama_running() - 检测 Ollama 是否运行
  - [ ] 4.6 实现 wait_for_service() - 等待服务就绪

- [ ] 5. 实现模型管理模块（model.rs）
  - [ ] 5.1 实现 get_model_list() - 获取官方和本地模型列表
  - [ ] 5.2 实现 download_model() - 模型下载（支持进度回调）
  - [ ] 5.3 实现 start_model() - 启动指定模型
  - [ ] 5.4 实现 stop_model() - 停止当前运行模型
  - [ ] 5.5 实现 switch_model() - 切换模型
  - [ ] 5.6 实现 delete_model() - 删除本地模型
  - [ ] 5.7 实现 get_current_model() - 获取当前运行模型
  - [ ] 5.8 实现智能推荐算法 - recommend_models(), calculate_compatibility_score()

- [ ] 6. 实现状态监控模块（monitor.rs）
  - [ ] 6.1 实现 get_resource_usage() - 获取 CPU/内存/GPU 使用率
  - [ ] 6.2 实现 get_model_status() - 获取模型运行状态
  - [ ] 6.3 实现 get_gpu_usage() - 使用 nvml 获取 GPU 详细信息
  - [ ] 6.4 实现进程管理和 uptime 计算

- [ ] 7. 实现 API 信息生成模块（api.rs）
  - [ ] 7.1 实现 generate_api_info() - 生成 API 地址、模型 ID、提供商信息
  - [ ] 7.2 实现 verify_api_info() - 验证 API 可用性
  - [ ] 7.3 实现 test_model_inference() - 测试模型推理能力
  - [ ] 7.4 实现配置导入导出功能

- [ ] 8. 实现前端状态管理和类型定义
  - [ ] 8.1 创建 TypeScript 类型定义（对应 Rust 数据结构）
  - [ ] 8.2 创建 Zustand Store - appStore（应用状态）
  - [ ] 8.3 创建 Zustand Store - modelStore（模型状态）
  - [ ] 8.4 创建 Zustand Store - configStore（配置状态）
  - [ ] 8.5 创建 Tauri IPC 调用封装

- [ ] 9. 实现前端核心 UI 组件
  - [ ] 9.1 实现 Dashboard 页面 - 系统概览和快捷操作
  - [ ] 9.2 实现 ModelList 组件 - 模型列表、搜索、过滤
  - [ ] 9.3 实现 ModelDetail 组件 - 模型详情、启动/下载按钮
  - [ ] 9.4 实现 DownloadProgress 组件 - 下载进度条显示
  - [ ] 9.5 实现 ApiPanel 组件 - API 信息展示和测试
  - [ ] 9.6 实现 Settings 页面 - 配置管理界面
  - [ ] 9.7 实现 SystemInfo 组件 - 系统配置显示
  - [ ] 9.8 实现 ResourceMonitor 组件 - 实时资源监控

- [ ] 10. 实现国际化支持
  - [ ] 10.1 配置 i18next 和语言检测
  - [ ] 10.2 创建简体中文翻译资源
  - [ ] 10.3 创建英文翻译资源
  - [ ] 10.4 实现语言切换功能

- [ ] 11. 实现错误处理和用户反馈
  - [ ] 11.1 实现错误边界组件
  - [ ] 11.2 实现 Toast 通知组件
  - [ ] 11.3 实现错误日志记录
  - [ ] 11.4 实现诊断信息生成

- [ ] 12. 检查点 - 确保核心功能可用
  - 确保 Tauri Commands 正确注册和调用
  - 确保系统配置检测返回正确数据
  - 确保 Ollama 可以正常安装和启动

- [ ] 13. 完善和优化（可选任务）
  - [ ]* 13.1 编写 Rust 后端单元测试
  - [ ]* 13.2 编写前端组件测试
  - [ ]* 13.3 实现深色/浅色主题切换
  - [ ]* 13.4 实现自定义模型源管理
  - [ ]* 13.5 性能优化和加载状态优化
