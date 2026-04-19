import { ArrowRight } from "lucide-react";
import Link from "next/link";

type Category = {
  id: number;
  name: string;
  totalQuiz: number;
  description: string | null;
  imageUrl: string | null;
};

interface CategoriesSectionProps {
  catRef?: React.RefObject<HTMLElement>;
  categories?: Category[];
}

export default function CategoriesSection({
  catRef,
  categories,
}: CategoriesSectionProps) {
  return (
    <section
      ref={catRef}
      className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 py-16"
    >
      <div className="mb-10">
        <p className="text-[11px] text-sky-400 tracking-[0.22em] uppercase mb-2 font-mono">
          // explore topics
        </p>
        <h2 className="font-display text-3xl md:text-4xl font-extrabold text-white">
          Pick your battleground
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories?.map((cat) => (
          <Link key={cat.id} href={`/quizzes?category=${cat.id}`}>
            <div className="group relative h-[200px] rounded-2xl overflow-hidden border border-white/5 bg-[#0f1629] cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-sky-500/30">
              {cat.imageUrl ? (
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-[0.28] group-hover:opacity-[0.28] transition-opacity duration-300"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-violet-500/5" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#080b14] via-[#080b14]/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                {/* Quiz count badge */}
                <span className="inline-block text-[10px] text-sky-400 tracking-widest uppercase bg-sky-400/10 border border-sky-400/20 rounded-full px-3 py-0.5 mb-2">
                  {cat.totalQuiz === 1 ? "1 quiz" : `${cat.totalQuiz} quizzes`}
                </span>

                {/* Name */}
                <h3 className="font-display font-extrabold text-lg text-white leading-tight mb-1">
                  {cat.name}
                </h3>

                {/* Description */}
                {cat.description && (
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                )}

                {/* Play now — revealed on hover */}
                <div className="flex items-center gap-1 text-[11px] text-sky-400 mt-2.5 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
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
