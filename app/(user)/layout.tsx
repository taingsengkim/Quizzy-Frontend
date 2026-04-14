import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/share-component/navbar";
import StoreProvider from "../StoreProvider";
import Footer from "@/components/user-page/footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const FLOATING_SYMBOLS = [
    "{}",
    "</>",
    "=>",
    "&&",
    "||",
    "??",
    "++",
    "--",
    "[]",
    "()",
    "//",
    "/*",
    "*/",
    "fn",
    "let",
    "var",
    "if",
    "for",
    ">>>",
    "===",
  ];
  return (
    <div className=" text-slate-200">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&family=Syne:wght@700;800&display=swap');
        .font-mono-custom { font-family: 'JetBrains Mono', monospace; }
        .font-display     { font-family: 'Syne', sans-serif; }
        @keyframes blink      { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes floatUp    { 0%{transform:translateY(100vh) rotate(0deg);opacity:0} 8%{opacity:1} 92%{opacity:.4} 100%{transform:translateY(-80px) rotate(15deg);opacity:0} }
        @keyframes fadeSlideUp{ from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .animate-fade-up { animation: fadeSlideUp .45s ease forwards; }
        .float-sym { position:absolute; animation: floatUp linear infinite; user-select:none; pointer-events:none; }
        .grid-bg {
          background-image:
            linear-gradient(rgba(56,189,248,.04) 1px, transparent 1px),
            linear-gradient(90deg,rgba(56,189,248,.04) 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>
      <div
        className="fixed -top-48 -left-48 w-[600px] h-[600px] rounded-full pointer-events-none z-1"
        style={{
          background:
            "radial-gradient(circle,rgba(59,130,246,.12) 0%,transparent 70%)",
        }}
      />
      <div className="grid-bg fixed inset-0 pointer-events-none z-1" />

      <div
        className="fixed -bottom-64 -right-24 w-[700px] h-[700px] rounded-full pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(circle,rgba(139,92,246,.10) 0%,transparent 70%)",
        }}
      />
      {/* Floating code symbols */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-1">
        {FLOATING_SYMBOLS.map((s, i) => (
          <span
            key={i}
            className="float-sym font-mono text-xs text-green-700"
            style={{
              left: `${(i * 5.3) % 95}%`,
              animationDuration: `${2 + ((i * 3.7) % 14)}s`,
              animationDelay: `${(i * 1.9) % 1}s`,
            }}
          >
            {s}
          </span>
        ))}
      </div>
      <Navbar />
      <main>
        {children}
        <Footer />
      </main>
    </div>
  );
}
