import { PageResponse } from "@/lib/pagination";
import CategoryReponse from "@/lib/types/quiz";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface CategoriesSectionProps {
  catRef?: React.RefObject<HTMLElement>;
  categories?: PageResponse<CategoryReponse>;
}

export default function CategoriesSection({
  catRef,
  categories,
}: CategoriesSectionProps) {
  return (
    <section
      ref={catRef}
      className="relative z-10 max-w-6xl mx-auto px-6 md:px-10
            transition-colors duration-300"
    >
      <div className="mb-10">
        <p className="text-[11px] text-sky-500 dark:text-sky-400 tracking-[0.22em] uppercase mb-2 font-mono">
          // explore topics
        </p>

        <h2
          className="font-display text-3xl md:text-4xl font-extrabold 
                   text-gray-900 dark:text-white"
        >
          Pick your battleground
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories?.content?.map((cat) => (
          <Link key={cat.id} href={`/quizzes?category=${cat.id}`}>
            <div
              className="group relative h-[200px] rounded-2xl overflow-hidden 
                     border border-gray-200 dark:border-white/5 
                     bg-gray-100 dark:bg-[#0f1629] 
                     cursor-pointer transition-all duration-300 
                     hover:-translate-y-1 
                     hover:border-sky-400/40"
            >
              {cat.imageUrl ? (
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover 
                         opacity-80 dark:opacity-[0.58]"
                />
              ) : (
                <div
                  className="absolute inset-0 bg-gradient-to-br 
                            from-sky-500/10 to-violet-500/10 
                            dark:from-sky-500/5 dark:to-violet-500/5"
                />
              )}

              <div
                className="absolute inset-0 bg-gradient-to-t 
                          from-white via-white/70 to-transparent 
                          dark:from-[#080b14] dark:via-[#080b14]/60 dark:to-transparent"
              />

              <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                <span
                  className="inline-block text-[10px] 
                         text-sky-600 dark:text-sky-400 
                         tracking-widest uppercase 
                         bg-sky-500/10 border border-sky-500/20 
                         rounded-full px-3 py-0.5 mb-2"
                >
                  {cat.totalQuiz === 1 ? "1 quiz" : `${cat.totalQuiz} quizzes`}
                </span>

                <h3
                  className="font-display font-extrabold text-lg 
                         text-gray-900 dark:text-white 
                         leading-tight mb-1"
                >
                  {cat.name}
                </h3>

                {cat.description && (
                  <p className="text-xs text-gray-600 dark:text-slate-400 line-clamp-2">
                    {cat.description}
                  </p>
                )}

                <div
                  className="flex items-center gap-1 text-[11px] 
                         text-sky-600 dark:text-sky-400 
                         mt-2.5 opacity-0 -translate-y-1 
                         group-hover:opacity-100 group-hover:translate-y-0 
                         transition-all duration-200"
                >
                  play now <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
