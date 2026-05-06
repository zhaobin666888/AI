"use client";

import { useEffect, useRef, useState } from "react";

type GuessResponse = {
  guess: string;
  confidence: string;
  raw: string;
};

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GuessResponse | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 5;
  }, []);

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setDrawing(true);
  };

  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const onUp = () => setDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setResult(null);
    setError("");
  };

  const guess = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const base64 = canvas.toDataURL("image/png").split(",")[1];
      const resp = await fetch("/api/guess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64 }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "请求失败");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "未知错误");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <h1>AI 你画我猜</h1>
      <p className="small">在画布上作画，然后让 AI 来猜。后端直接调用 Gemini API（无 SDK）。</p>

      <div className="card">
        <div className="canvasWrap">
          <canvas
            ref={canvasRef}
            width={720}
            height={420}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerLeave={onUp}
          />
        </div>

        <div className="actions">
          <button onClick={guess} disabled={loading}>{loading ? "AI 猜测中..." : "让 AI 猜"}</button>
          <button onClick={clearCanvas} disabled={loading}>清空画布</button>
        </div>

        {error && <p className="error">错误：{error}</p>}

        {result && (
          <div className="result">
            <div><strong>AI 猜测：</strong>{result.guess}</div>
            <div><strong>置信度：</strong>{result.confidence}</div>
            <div className="small"><strong>原始输出：</strong>{result.raw}</div>
          </div>
        )}
      </div>
    </main>
  );
}
