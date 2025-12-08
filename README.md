# Typli API - Zeabur Edition

🚀 **OpenAI 兼容 API 代理服务** | 聊天 + 文生图统一接口 | Zeabur 免费部署

[![Deploy on Zeabur](https://zeabur.com/button.svg)](https://zeabur.com/templates)

## ✨ 特性

- **🆓 完全免费**: 基于 Zeabur Free Tier，每月 10GB 免费流量
- **🤖 多模型支持**: Grok-4, Claude, GPT-5, Gemini, DeepSeek
- **🎨 文生图功能**: FLUX 2, FLUX 2 Pro, Stable Diffusion v3.5, Nano Banana
- **🔄 无限额度**: 每次请求自动生成新 Session，绕过 Typli 1000 词限制
- **🔌 OpenAI 兼容**: 支持标准 `/v1/chat/completions` 接口
- **📊 用量监控**: 实时跟踪请求数、流量、预估费用
- **🌐 WebUI**: 内置美观的调试界面

## 🛠️ 技术栈

- **后端**: Node.js 20 + Express.js
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

### 方法 2: 手动部署

#### 步骤 1: Fork 仓库

```bash
# Clone 你 fork 的仓库
git clone https://github.com/你的用户名/typli-api-zeabur.git
cd typli-api-zeabur
```

#### 步骤 2: 本地测试

```bash
# 安装依赖
npm install

# 创建 .env 文件
cp .env.example .env

# 编辑 .env （可选）
vim .env

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

#### 步骤 3: 部署到 Zeabur

1. 访问 [dash.zeabur.com](https://dash.zeabur.com)
2. 创建新项目 **New Project**
3. **Deploy New Service** → **Git**
4. 选择你的 GitHub 仓库 `typli-api-zeabur`
5. Zeabur 自动检测 `package.json` 并开始构建
6. 等待 2-3 分钟部署完成

#### 步骤 4: 配置环境变量（可选）

在 Zeabur Dashboard 中选择你的服务 → **Variables** 标签页：

```bash
# 自定义 API 密钥（默认为 "1"）
API_MASTER_KEY=your-secret-key

# 添加 OpenAI 官方支持（可选）
OPENAI_API_KEY=sk-xxx
OPENAI_BASE_URL=https://api.openai.com/v1
```

## 📚 使用文档

### API 端点

基础 URL: `https://your-service.zeabur.app`

#### 1. 聊天完成

```bash
curl https://your-service.zeabur.app/v1/chat/completions \
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
curl https://your-service.zeabur.app/v1/chat/completions \
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
curl https://your-service.zeabur.app/v1/models \
  -H "Authorization: Bearer 1"
```

### Python 示例

```python
from openai import OpenAI

client = OpenAI(
    api_key="1",  # 你的 API 密钥
    base_url="https://your-service.zeabur.app/v1"
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
const response = await fetch('https://your-service.zeabur.app/v1/chat/completions', {
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

### 聊天模型

- `xai/grok-4-fast` - Grok-4 快速版
- `xai/grok-4-fast-reasoning` - Grok-4 推理版
- `anthropic/claude-haiku-4-5` - Claude Haiku 4.5
- `openai/gpt-5` - GPT-5
- `openai/gpt-4o` - GPT-4o
- `google/gemini-2.5-flash` - Gemini 2.5 Flash
- `deepseek/deepseek-reasoner` - DeepSeek Reasoner
- `deepseek/deepseek-chat` - DeepSeek Chat

### 文生图模型

- `fal-ai/flux-2` - FLUX 2 基础版
- `fal-ai/flux-2-pro` - FLUX 2 Pro（最高质量）
- `fal-ai/flux-2-dev` - FLUX 2 Dev（32B 参数）
- `fal-ai/nano-banana-pro` - Nano Banana Pro
- `fal-ai/stable-diffusion-v35-large` - Stable Diffusion v3.5

## 📊 用量监控

访问 WebUI 首页实时查看：

- 总请求数
- 流量使用情况
- 运行时间
- Free Tier 剩余额度
- 预估费用（超过 10GB 后才收费）

## ⚠️ 注意事项

1. **免费额度**: Zeabur Free Tier 每月 10GB 流量，超出后按 $0.1/GB 计费
2. **Serverless 冷启动**: 首次请求可能需要 2-3 秒加载
3. **速率限制**: Typli 原始限制为 100 请求/小时
4. **模型可用性**: 部分模型可能因 Typli 调整而不可用

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

### 2. 502 Bad Gateway

- 等待 1-2 分钟，Serverless 冷启动需要时间
- 检查 `/health` 端点是否响应

### 3. 模型不可用

- 访问 `/v1/models` 查看当前可用模型
- Typli 可能调整了模型列表

## 🔗 相关链接

- [Zeabur 官网](https://zeabur.com)
- [Zeabur 文档](https://zeabur.com/docs)
- [Typli AI](https://typli.ai)
- [OpenAI API 文档](https://platform.openai.com/docs)

## 📝 开源协议

Apache-2.0 License - 详见 [LICENSE](LICENSE)

## 👏 贡献

欢迎 PR 和 Issue！

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交修改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## ⭐ Star History

如果这个项目对你有帮助，请给个 Star ⭐！

---

**Made with ❤️ by [kinai9661](https://github.com/kinai9661)**
