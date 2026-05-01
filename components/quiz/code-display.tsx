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
    <div className="my-4 max-w-full overflow-hidden">
      <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#080b14] w-full min-w-0">
        {/* header */}
        <div className="flex items-center justify-between px-3 py-2.5 bg-slate-50 dark:bg-[#0f1420] border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 min-w-0 overflow-hidden">
            <div className="flex gap-1.5 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 uppercase tracking-widest min-w-0">
              <Terminal className="w-3 h-3 shrink-0" />
              <span className="truncate">code snippet</span>
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 shrink-0 ml-2 text-[10px] font-mono uppercase tracking-widest text-slate-500 hover:text-sky-500 dark:hover:text-sky-400 transition-colors px-2 py-1 rounded-md hover:bg-sky-500/10"
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

        {/* body */}
        <div className="flex">
          {/* line numbers */}
          <div className="select-none shrink-0 py-4 px-2 text-right border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#080b14]">
            {lines.map((_, i) => (
              <div
                key={i}
                className="font-mono text-[10px] text-slate-400 dark:text-slate-700 leading-6"
              >
                {i + 1}
              </div>
            ))}
          </div>

          {/* code — single scroll zone */}
          <pre
            className="py-4 px-3 m-0 overflow-x-auto"
            style={{ width: 0, minWidth: "100%" }}
          >
            <code className="font-mono text-xs leading-6 text-slate-700 dark:text-slate-300 block whitespace-pre">
              {code}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}
