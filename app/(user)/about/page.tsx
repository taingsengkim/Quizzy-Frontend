"use client";

import Image from "next/image";
import Link from "next/link";
import { Users, Award, BookOpen, Zap, Trophy, Target } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const features = [
  { icon: Users, title: "Public Speaking" },
  { icon: Award, title: "Career-Oriented" },
  { icon: BookOpen, title: "Creative Thinking" },
];

const stats = [
  {
    icon: Zap,
    value: "10K+",
    label: "Quizzes Taken",
    color: "from-sky-400 to-blue-500",
  },
  {
    icon: Trophy,
    value: "5K+",
    label: "Active Players",
    color: "from-violet-400 to-purple-500",
  },
  {
    icon: Target,
    value: "250+",
    label: "Quizzes Available",
    color: "from-emerald-400 to-teal-500",
  },
];

const teachers = [
  {
    name: "Mr. Kit Dara",
    role: "dataBase",
    src: "/teacher tara.jpg",
    specialty: "Public Speaking",
  },
  {
    name: "Mrs. Mom Reksmey",
    role: "frontEnd",
    src: "/teacher reaksmey.png",
    specialty: "Career Development",
  },
  {
    name: "Mr. Chan Chhaya",
    role: "springBoot",
    src: "/teacher chhaya.jpg",
    specialty: "Creative Thinking",
  },
];

const team = [
  { name: "Taing Sengkim", role: "fullStack", src: "/sengkim.png" },
  { name: "Soeurt Bomnorng", role: "frontEnd", src: "/bomnorng.jpg" },
  { name: "Lut Lina", role: "frontEnd", src: "/Lina.PNG" },
  { name: "Chit Chimy", role: "backEnd", src: "/Chimy.jpg" },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 18 },
  },
};

function TeacherCard({
  teacher,
  index,
}: {
  teacher: (typeof teachers)[0];
  index: number;
}) {
  const [hovered, setHovered] = useState(false);
  const accentColors = [
    {
      ring: "ring-sky-400",
      glow: "shadow-sky-500/30",
      badge: "bg-sky-500/10 text-sky-300 border-sky-500/20",
      dot: "bg-sky-400",
    },
    {
      ring: "ring-violet-400",
      glow: "shadow-violet-500/30",
      badge: "bg-violet-500/10 text-violet-300 border-violet-500/20",
      dot: "bg-violet-400",
    },
    {
      ring: "ring-emerald-400",
      glow: "shadow-emerald-500/30",
      badge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
      dot: "bg-emerald-400",
    },
  ];
  const accent = accentColors[index % accentColors.length];

  return (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative group"
    >
      {/* Glow backdrop */}
      <motion.div
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className={`absolute inset-0 rounded-3xl blur-xl ${accent.glow} shadow-2xl pointer-events-none`}
      />

      <div className="relative bg-[#0d1220] border border-slate-800 rounded-3xl p-8 overflow-hidden transition-colors duration-300 group-hover:border-slate-700">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Corner accent */}
        <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-slate-700 rounded-tr-3xl group-hover:border-slate-600 transition-colors" />

        {/* Photo */}
        <div
          className="relative mx-auto mb-6"
          style={{ width: 120, height: 120 }}
        >
          {/* Spinning ring */}
          <motion.div
            animate={{ rotate: hovered ? 360 : 0 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className={`absolute inset-0 rounded-full ring-2 ${accent.ring} ring-offset-4 ring-offset-[#0d1220]`}
            style={{ opacity: hovered ? 1 : 0.4, transition: "opacity 0.3s" }}
          />
          <div className="relative w-full h-full rounded-full overflow-hidden">
            <Image
              src={teacher.src}
              alt={teacher.name}
              fill
              className="object-cover"
            />
          </div>
          {/* Online indicator */}
          <span
            className={`absolute bottom-1 right-1 w-4 h-4 ${accent.dot} rounded-full border-2 border-[#0d1220]`}
          />
        </div>

        {/* Info */}
        <div className="relative text-center space-y-3">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              {teacher.name}
            </h3>
            <p className="text-slate-400 text-sm">{teacher.role}</p>
          </div>

          {/* Specialty badge */}
          <span
            className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-medium ${accent.badge}`}
          >
            <span className={`w-1 h-1 rounded-full ${accent.dot}`} />
            {teacher.specialty}
          </span>

          {/* Divider */}
          <div className="border-t border-slate-800 pt-4 mt-2">
            <p className="text-xs text-slate-500 leading-relaxed italic">
              &ldquo;Education is the most powerful weapon which you can use to
              change the world.&rdquo;
            </p>
          </div>

          {/* Social row */}
          <div className="flex justify-center gap-2 pt-1">
            {["f", "ig", "tw", "yt"].map((s, i) => (
              <motion.a
                key={i}
                href="#"
                whileHover={{ scale: 1.15, y: -2 }}
                whileTap={{ scale: 0.9 }}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white text-xs font-bold transition-colors border border-slate-700"
              >
                {s}
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function TeamCard({ member }: { member: (typeof team)[0] }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="flex items-center gap-5  bg-[#0d1220] border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-colors group"
    >
      <div className="relative shrink-0" style={{ width: 122, height: 122 }}>
        <div className="w-full h-full rounded-2xl overflow-hidden">
          <Image
            src={member.src}
            alt={member.name}
            fill
            className="object-cover rounded-2xl"
          />
        </div>
      </div>
      <div>
        <h4 className="font-semibold text-white group-hover:text-sky-300 transition-colors">
          {member.name}
        </h4>
        <p className="text-xs text-slate-500 mt-0.5">{member.role}</p>
        <div className="flex gap-1.5 mt-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className="w-1.5 h-1.5 rounded-full bg-slate-700" />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function AboutPage() {
  return (
    <div className="min-h-screen mt-10 text-white">
      {/* ── HERO ── */}
      <section className="pt-16 pb-20 relative overflow-hidden">
        {/* Ambient blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          {/* Left */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            className="space-y-8"
          >
            {/* Pill label */}
            <div className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-500/20 rounded-full px-4 py-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              <span className="text-sky-400 text-xs tracking-widest uppercase font-mono">
                About Quizzy
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl font-extrabold leading-[1.1] tracking-tight">
              Up Your Skills
              <br />
              To Advance With
              <br />
              <span className="bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent">
                Your Quizzy
              </span>
            </h1>

            <p className="text-slate-400 text-lg leading-relaxed max-w-md">
              Improve your knowledge and sharpen your skills with Quizzy. Learn,
              practice, and challenge yourself through interactive quizzes
              designed to boost your learning every day.
            </p>

            <div className="flex flex-wrap gap-4 items-center">
              <Link href="/">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-gradient-to-r from-sky-500 to-violet-500 hover:from-sky-400 hover:to-violet-400 text-white font-semibold px-8 py-3.5 rounded-2xl text-sm transition-all shadow-lg shadow-sky-500/20"
                >
                  Get Started
                </motion.button>
              </Link>
            </div>

            <div className="flex flex-wrap gap-6 pt-2">
              {features.map((f, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.12 }}
                  className="flex items-center gap-2 text-sm text-slate-300"
                >
                  <f.icon size={16} className="text-sky-400" />
                  {f.title}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* Right — hero visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="relative flex justify-center items-center min-h-[420px]"
          >
            <div className="relative w-72 sm:w-80 lg:w-96 aspect-square">
              {[300, 360, 420].map((size, i) => (
                <motion.div
                  key={i}
                  animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                  transition={{
                    duration: 20 + i * 5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-500/10 pointer-events-none"
                  style={{ width: size, height: size }}
                />
              ))}

              <div className="relative w-full h-full rounded-full overflow-hidden shadow-2xl ring-4 ring-sky-500/20">
                <Image
                  src="/Student.png"
                  alt="Happy Student"
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Stat cards */}
              {stats.map((s, i) => {
                const positions = [
                  "absolute -top-6 left-2",
                  "absolute top-10 -right-4",
                  "absolute -bottom-4 right-8",
                ];
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.2 }}
                    className={`${positions[i]} bg-[#0d1220]/95 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 flex items-center gap-3 z-20`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center`}
                    >
                      <s.icon size={18} className="text-white" />
                    </div>
                    <div>
                      <p
                        className={`font-bold text-xl leading-none bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}
                      >
                        {s.value}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── MISSION ── */}
      <section className="py-20 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="relative h-80 md:h-96 rounded-3xl overflow-hidden"
          >
            <Image
              src="/team.png"
              alt="Students"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080b14]/60 to-transparent" />
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-2">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              <span className="text-violet-400 text-xs tracking-widest uppercase font-mono">
                Our Mission
              </span>
            </div>
            <h2 className="text-3xl font-bold text-white">
              Built for learners,
              <br />
              by educators
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Our quiz platform was created to provide a stable, secure, and
              easy-to-use digital environment for users who want to showcase
              content, create masterpieces, and connect with their communities
              through Quizzy.
            </p>
            <p className="text-slate-400 leading-relaxed">
              At Quizzy, we believe every student has the ability to create
              their own future. We nurture, inspire, and motivate you to become
              skilled and creative individuals in the digital age.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── TEACHERS ── */}
      <section className="py-20 border-t border-slate-800/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sky-950/10 to-transparent pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            className="text-center mb-14 space-y-4"
          >
            <div className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-500/20 rounded-full px-4 py-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              <span className="text-sky-400 text-xs tracking-widest uppercase font-mono">
                Faculty
              </span>
            </div>
            <h2 className="text-4xl font-extrabold text-white tracking-tight">
              Meet Our Best Teachers
            </h2>
            <p className="text-slate-400 max-w-md mx-auto">
              World-class educators dedicated to helping you reach your full
              potential.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {teachers.map((t, i) => (
              <TeacherCard key={i} teacher={t} index={i} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section className="py-20 border-t border-slate-800/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            className="text-center mb-14 space-y-4"
          >
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-xs tracking-widest uppercase font-mono">
                The Team
              </span>
            </div>
            <h2 className="text-4xl font-extrabold text-white tracking-tight">
              Meet Our Team
            </h2>
            <p className="text-slate-400">
              The people who built Quizzy from the ground up.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {team.map((member, i) => (
              <TeamCard key={i} member={member} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <section className="py-20 border-t border-slate-800/50">
        <div className="max-w-2xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl font-bold text-white">
            Ready to start learning?
          </h2>
          <p className="text-slate-400">
            Join thousands of students already leveling up with Quizzy.
          </p>
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="bg-gradient-to-r from-sky-500 to-violet-500 text-white font-semibold px-10 py-4 rounded-2xl text-sm shadow-lg shadow-sky-500/20 transition-all"
            >
              Get Started — It&apos;s Free
            </motion.button>
          </Link>
        </div>
      </section>
    </div>
  );
}
