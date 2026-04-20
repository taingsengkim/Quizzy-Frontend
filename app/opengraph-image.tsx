import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Quizzy for Devs – Programming Quizzes for Developers";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0a0a0a",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          fontFamily: "monospace",
        }}
      >
        {/* Top label */}
        <div style={{ color: "#666", fontSize: 24, marginBottom: 24 }}>
          // programming quizzes for developers
        </div>

        {/* Logo */}
        <div
          style={{
            color: "#fff",
            fontSize: 80,
            fontWeight: "bold",
            marginBottom: 16,
          }}
        >
          quizzy_
        </div>

        {/* Tagline */}
        <div style={{ color: "#a3a3a3", fontSize: 32, marginBottom: 48 }}>
          Stop guessing. Start proving.
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 48 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{ color: "#22c55e", fontSize: 36, fontWeight: "bold" }}
            >
              600+
            </span>
            <span style={{ color: "#666", fontSize: 20 }}>questions</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{ color: "#22c55e", fontSize: 36, fontWeight: "bold" }}
            >
              12
            </span>
            <span style={{ color: "#666", fontSize: 20 }}>languages</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{ color: "#22c55e", fontSize: 36, fontWeight: "bold" }}
            >
              50K+
            </span>
            <span style={{ color: "#666", fontSize: 20 }}>devs ranked</span>
          </div>
        </div>

        {/* URL watermark */}
        <div
          style={{
            position: "absolute",
            bottom: 48,
            right: 80,
            color: "#444",
            fontSize: 20,
          }}
        >
          quizzy.it.com
        </div>
      </div>
    ),
    { ...size },
  );
}
