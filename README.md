# AI 你画我猜（Next.js + Gemini API）

## 启动

```bash
npm install
cp .env.example .env.local
# 在 .env.local 中填写 GEMINI_API_KEY
npm run dev
```

打开 http://localhost:3000

## 说明
- 前端：Next.js App Router + HTML Canvas
- 后端：`app/api/guess/route.ts`
- AI 调用：服务端直接 `fetch` Gemini REST API，不使用 SDK
