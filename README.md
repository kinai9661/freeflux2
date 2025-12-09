# Typli API - Zeabur Edition

🚀 **OpenAI 兼容 API 代理服务** | 聊天 + 文生图统一接口 | Zeabur 免费部署 | **全新 WebUI**

[![Deploy on Zeabur](https://zeabur.com/button.svg)](https://zeabur.com/templates)

## ✨ 特性

### 🎉 全新 WebUI（New!）

- **💬 流式对话界面** - 实时打字机效果，支持 Markdown 渲染和代码高亮
- **🎨 AI 绘画工具** - 一键生成高质量图片，支持批量生成（1-4 张）
- **🌓 深色主题** - 精心设计的现代化 UI，护眼舒适
- **📱 响应式设计** - 完美适配桌面和移动端
- **⚡ 实时预览** - 图片即时展示，支持下载和分享

### 🚀 核心功能

- **🆓 完全免费**: 基于 Zeabur Free Tier，每月 10GB 免费流量
- **🤖 多模型支持**: Grok-4, Claude, GPT-5, Gemini, DeepSeek
- **🎨 文生图功能**: FLUX 2, FLUX 2 Pro, Stable Diffusion v3.5, Nano Banana
- **🔄 无限额度**: 每次请求自动生成新 Session，绕过 Typli 1000 词限制
- **🔌 OpenAI 兼容**: 支持标准 `/v1/chat/completions` 接口
- **📊 用量监控**: 实时跟踪请求数、流量、预估费用

## 🌐 在线演示

- **WebUI**: [https://fluxes.zeabur.app/chat](https://fluxes.zeabur.app/chat)
- **监控面板**: [https://fluxes.zeabur.app](https://fluxes.zeabur.app)
- **API 端点**: `https://fluxes.zeabur.app/v1/chat/completions`

## 🖥️ WebUI 预览

### 聊天界面

- ✅ 8+ AI 模型可选（Grok-4、GPT-5、Claude、Gemini 等）
- ✅ 流式响应，实时显示
- ✅ Markdown 完美渲染（代码高亮、表格、列表）
- ✅ Temperature 参数调节（0-2）
- ✅ 对话历史管理
- ✅ 一键清空会话

### 文生图界面

- ✅ 5 种专业图片模型
  - FLUX 2 Pro（最高质量）
  - FLUX 2 Dev（32B 参数）
  - FLUX 2 基础版
  - Stable Diffusion v3.5 Large
  - Nano Banana Pro
- ✅ 批量生成（1-4 张图片）
- ✅ 实时生成进度
- ✅ 图片画廊展示
- ✅ 一键下载原图

### 访问 WebUI

```
https://fluxes.zeabur.app/chat
```

或在监控面板首页点击 **🎉 进入 WebUI** 按钮

## 🛠️ 技术栈

- **后端**: Node.js 20 + Express.js
- **前端**: Vanilla JS + Tailwind CSS + Marked.js + Highlight.js
- **部署**: Zeabur Serverless
- **上游**: Typli Free API
- **协议**: OpenAI API v1 Compatible

## 🚀 快速部署

### 方法 1: 一键部署（推荐）

1. 点击上方 **Deploy on Zeabur** 按钮
2. 授权 GitHub 账号
3. Fork 本仓库到你的账号
4. Zeabur 自动开始构建和部署
5. 部署完成后获得 `.zeabur.app` 域名
6. 🎉 访问 `/chat` 开始使用 WebUI

### 方法 2: 手动部署

#### 步骤 1: Fork 仓库

```bash
# Clone 你 fork 的仓库
git clone https://github.com/你的用户名/freeflux2.git
cd freeflux2
```

#### 步骤 2: 本地测试

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
# WebUI: http://localhost:3000/chat
```

#### 步骤 3: 部署到 Zeabur

1. 访问 [dash.zeabur.com](https://dash.zeabur.com)
2. 创建新项目 **New Project**
3. **Deploy New Service** → **Git**
4. 选择你的 GitHub 仓库 `freeflux2`
5. Zeabur 自动检测 `package.json` 并开始构建
6. 等待 2-3 分钟部署完成

## 📚 使用文档

### 方式 1: WebUI（推荐新手）

直接访问 [https://fluxes.zeabur.app/chat](https://fluxes.zeabur.app/chat)，无需编程即可使用。

### 方式 2: API 调用（开发者）

#### 1. 聊天完成

```bash
curl https://fluxes.zeabur.app/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 1" \
  -d '{
    "model": "xai/grok-4-fast",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ],
    "stream": true
  }'
```

#### 2. 文生图（同一接口）

```bash
curl https://fluxes.zeabur.app/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 1" \
  -d '{
    "model": "fal-ai/flux-2",
    "messages": [
      {"role": "user", "content": "A cat reading a book"}
    ]
  }'
```

#### 3. 模型列表

```bash
curl https://fluxes.zeabur.app/v1/models \
  -H "Authorization: Bearer 1"
```

### Python 示例

```python
from openai import OpenAI

client = OpenAI(
    api_key="1",
    base_url="https://fluxes.zeabur.app/v1"
)

# 聊天
response = client.chat.completions.create(
    model="xai/grok-4-fast",
    messages=[{"role": "user", "content": "Hello!"}]
)
print(response.choices[0].message.content)

# 文生图
image_response = client.chat.completions.create(
    model="fal-ai/flux-2",
    messages=[{"role": "user", "content": "A futuristic city"}]
)
print(image_response.choices[0].message.content)  # 返回 Markdown 图片链接
```

### JavaScript 示例

```javascript
const response = await fetch('https://fluxes.zeabur.app/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer 1'
  },
  body: JSON.stringify({
    model: 'xai/grok-4-fast',
    messages: [{ role: 'user', content: 'Hello!' }],
    stream: true
  })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  console.log(chunk);
}
```

## 🧠 支持的模型

### 聊天模型（8 个）

| 模型 ID | 名称 | 特点 |
|---------|------|------|
| `xai/grok-4-fast` | Grok-4 Fast | 🚀 极速响应 |
| `xai/grok-4-fast-reasoning` | Grok-4 Reasoning | 🧠 深度推理 |
| `anthropic/claude-haiku-4-5` | Claude Haiku 4.5 | ⚡ 轻量快速 |
| `openai/gpt-5` | GPT-5 | 🔥 最新旗舰 |
| `openai/gpt-4o` | GPT-4o | 🎯 多模态 |
| `google/gemini-2.5-flash` | Gemini 2.5 Flash | ⚡ Google 最快 |
| `deepseek/deepseek-reasoner` | DeepSeek Reasoner | 🧠 中文优化 |
| `deepseek/deepseek-chat` | DeepSeek Chat | 💬 通用对话 |

### 文生图模型（5 个）

| 模型 ID | 名称 | 特点 |
|---------|------|------|
| `fal-ai/flux-2-pro` | FLUX 2 Pro | 🏆 最高质量 |
| `fal-ai/flux-2-dev` | FLUX 2 Dev | 🎨 32B 参数 |
| `fal-ai/flux-2` | FLUX 2 | ⚡ 快速生成 |
| `fal-ai/stable-diffusion-v35-large` | Stable Diffusion v3.5 | 🖼️ 经典稳定 |
| `fal-ai/nano-banana-pro` | Nano Banana Pro | 🍌 轻量高效 |

## 📊 用量监控

访问首页 [https://fluxes.zeabur.app](https://fluxes.zeabur.app) 实时查看：

- ✅ 总请求数
- ✅ 流量使用情况（进度条可视化）
- ✅ 运行时间
- ✅ Free Tier 剩余额度
- ✅ 预估费用（超过 10GB 后才收费）

## 🎯 使用场景

### 1. 个人 AI 助手

- 编程问答和代码生成
- 写作润色和翻译
- 学习辅导和知识问答

### 2. AI 绘画工具

- 设计灵感图生成
- 社交媒体配图制作
- 概念艺术创作

### 3. API 接入

- 集成到自己的应用
- 聊天机器人开发
- AI 功能原型验证

### 4. 学习研究

- 测试不同 AI 模型表现
- 对比文生图模型效果
- OpenAI API 开发学习

## ⚠️ 注意事项

1. **免费额度**: Zeabur Free Tier 每月 10GB 流量，超出后按 $0.1/GB 计费
2. **Serverless 冷启动**: 首次请求可能需要 2-3 秒加载
3. **速率限制**: Typli 原始限制为 100 请求/小时（自动绕过）
4. **模型可用性**: 部分模型可能因 Typli 调整而不可用
5. **图片存储**: 生成的图片由 Typli 临时托管，建议及时下载保存

## 🔧 高级配置

### 自定义域名

在 Zeabur Dashboard → **Domains** 添加你的域名：

1. 添加 CNAME 记录指向 `cname.zeabur-dns.com`
2. 在 Zeabur 中添加自定义域名
3. 等待 SSL 证书自动配置

### 多 API 源支持

在环境变量中添加：

```bash
# OpenAI 官方
OPENAI_API_KEY=sk-xxx

# Ollama 本地
OLLAMA_BASE_URL=http://your-server:11434/v1

# Azure OpenAI
AZURE_OPENAI_ENDPOINT=https://xxx.openai.azure.com
AZURE_OPENAI_KEY=xxx
```

## 🐛 问题排查

### 1. 部署失败

- 检查 `package.json` 中 Node 版本 >= 18
- 查看 Zeabur 构建日志
- 确认 `zbpack.json` 配置正确

### 2. 502 Bad Gateway

- 等待 1-2 分钟，Serverless 冷启动需要时间
- 检查 `/health` 端点是否响应
- 查看 Zeabur Runtime Logs

### 3. WebUI 无法加载

- 确认访问路径为 `/chat`（不是 `/chat.html`）
- 检查浏览器控制台是否有 JavaScript 错误
- 清除浏览器缓存重试

### 4. 模型不可用

- 访问 `/v1/models` 查看当前可用模型
- Typli 可能调整了模型列表
- 尝试切换其他模型

### 5. 图片生成失败

- 检查提示词是否符合内容政策
- 切换其他图片模型重试
- 查看 Network 面板的错误信息

## 🔗 相关链接

- **在线演示**: [https://fluxes.zeabur.app](https://fluxes.zeabur.app)
- [Zeabur 官网](https://zeabur.com)
- [Zeabur 文档](https://zeabur.com/docs)
- [Typli AI](https://typli.ai)
- [OpenAI API 文档](https://platform.openai.com/docs)
- [项目仓库](https://github.com/kinai9661/freeflux2)

## 📈 项目路线图

- [x] 基础 API 代理功能
- [x] 聊天和文生图统一接口
- [x] 用量监控面板
- [x] WebUI 聊天界面
- [x] WebUI 文生图界面
- [ ] 用户认证系统
- [ ] 对话历史保存
- [ ] 图片历史管理
- [ ] 更多 AI 模型支持
- [ ] 插件系统

## 📝 开源协议

Apache-2.0 License - 详见 [LICENSE](LICENSE)

## 👏 贡献

欢迎 PR 和 Issue！

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交修改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 💖 赞助支持

如果这个项目对你有帮助，可以请作者喝杯咖啡 ☕

## ⭐ Star History

如果这个项目对你有帮助，请给个 Star ⭐！

[![Star History Chart](https://api.star-history.com/svg?repos=kinai9661/freeflux2&type=Date)](https://star-history.com/#kinai9661/freeflux2&Date)

---

**Made with ❤️ by [kinai9661](https://github.com/kinai9661)**

*Powered by Typli AI | Deployed on Zeabur*