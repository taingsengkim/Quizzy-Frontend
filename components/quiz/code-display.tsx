import { CheckCheck, Copy, Terminal } from "lucide-react";
import { useState } from "react";

export default function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const lines = code.split("\n");

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="my-8 rounded-2xl overflow-hidden border border-slate-700/50 shadow-2xl shadow-black/40 bg-[#080b14]">
      {/* title bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0f1420] border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            <Terminal className="w-3 h-3" />
            code snippet
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-slate-500 hover:text-sky-400 transition-colors px-2 py-1 rounded-md hover:bg-sky-500/10"
        >
          {copied ? (
            <>
              <CheckCheck className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              copy
            </>
          )}
        </button>
      </div>

      {/* code body */}
      <div className="flex overflow-x-auto">
        {/* line numbers */}
        <div className="select-none py-5 px-3 text-right border-r border-slate-800/80 bg-[#080b14] min-w-[3rem] shrink-0">
          {lines.map((_, i) => (
            <div key={i} className="font-mono text-xs text-slate-700 leading-6">
              {i + 1}
            </div>
          ))}
        </div>

        {/* code */}
        <pre className="flex-1 py-5 px-5 overflow-x-auto m-0">
          <code className="font-mono text-sm leading-6 text-slate-300 block whitespace-pre">
            {code}
          </code>
        </pre>
      </div>
    </div>
  );
}
