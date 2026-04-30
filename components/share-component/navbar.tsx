"use client";

import React, { useState } from "react";
import { Button } from "../ui/button";
import {
  ArrowRight,
  LogOut,
  User,
  Menu,
  X,
  Moon,
  Sun,
  Laptop,
} from "lucide-react";
import Link from "next/link";
import { useGetProfileQuery } from "@/lib/auth/api-auth/authSlice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { signOutUser } from "@/lib/auth/action/auth-action";
import { useDispatch } from "react-redux";
import { quizzy } from "@/lib/features/api/api";
import { useTheme } from "next-themes";

export default function Navbar() {
  const { data: user } = useGetProfileQuery(undefined, {
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { setTheme, theme } = useTheme();
  const dispatch = useDispatch();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/quizzes", label: "Quizzes" },
    { href: "/quizzes/multiplayer/join", label: "Join Room" },
    { href: "/quizzes/instant", label: "Instant Quiz" },
    { href: "/about", label: "About" },
  ];

  const handleLogout = async () => {
    await signOutUser();
    dispatch(quizzy.util.resetApiState());
    router.push("/login");
    router.refresh();
  };

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 dark:bg-[#080b14]/80 backdrop-blur-xl border-b border-slate-200 dark:border-sky-500/10 transition-colors duration-300">
      <div className="flex items-center justify-between px-6 md:px-10 py-4">
        {/* Logo */}
        <Link href="/" className="group shrink-0">
          <span className="font-display text-xl font-extrabold text-slate-900 dark:text-white">
            quiz<span className="text-sky-500 dark:text-sky-400">zy</span>
            <span className="text-violet-500 group-hover:animate-pulse">_</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8 text-[11px] text-slate-500 dark:text-slate-400 tracking-[0.18em] uppercase font-mono">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-sky-600 dark:hover:text-sky-400 transition"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop right side */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle - Visible for all on Desktop */}
          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
              >
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  <Sun className="w-4 h-4 mr-2" /> Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <Moon className="w-4 h-4 mr-2" /> Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  <Laptop className="w-4 h-4 mr-2" /> System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {user ? (
            <div className="hidden md:block">
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger className="focus:outline-none">
                  <Avatar className="h-8 w-8 border border-slate-200 dark:border-sky-500/40">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-slate-100 dark:bg-slate-900 text-sky-600 dark:text-sky-400 text-xs">
                      {user?.username?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 mt-2"
                  align="end"
                >
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <p className="text-slate-900 dark:text-white font-bold">
                        {user.username}
                      </p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                  <DropdownMenuItem onClick={() => router.push("/profile")}>
                    <User className="w-4 h-4 mr-2" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 dark:text-red-400"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-slate-700 dark:text-slate-300"
                >
                  login
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  className="text-xs bg-gradient-to-r from-blue-600 to-violet-600 text-white"
                >
                  play now <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
          )}

          {/* Hamburger Menu */}
          <button
            className="md:hidden text-slate-600 dark:text-slate-300 p-1"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden px-6 pb-8 pt-4 space-y-1 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#080b14]/95 backdrop-blur-xl">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block text-slate-600 dark:text-slate-400 text-sm py-3 hover:text-sky-600 dark:hover:text-sky-400 transition border-b border-slate-100 dark:border-slate-800/50"
            >
              {link.label}
            </Link>
          ))}

          {user ? (
            <div className="pt-4 space-y-1">
              <div className="flex items-center gap-3 py-3 mb-2">
                <Avatar className="h-10 w-10 border border-slate-200 dark:border-sky-500/40">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-slate-100 dark:bg-slate-900 text-sky-600 dark:text-sky-400">
                    {user?.username?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-slate-900 dark:text-white text-sm font-semibold">
                    {user.username}
                  </p>
                  <p className="text-slate-500 text-xs">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  router.push("/profile");
                  setMobileOpen(false);
                }}
                className="flex items-center gap-2 w-full text-slate-600 dark:text-slate-400 text-sm py-3 hover:text-sky-600 dark:hover:text-sky-400 transition"
              >
                <User className="w-4 h-4" /> Profile
              </button>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileOpen(false);
                }}
                className="flex items-center gap-2 w-full text-red-600 dark:text-red-400 text-sm py-3 hover:text-red-500 dark:hover:text-red-300 transition"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-6">
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                <Button
                  variant="outline"
                  className="w-full border-slate-200 dark:border-slate-700"
                >
                  login
                </Button>
              </Link>
              <Link href="/register" onClick={() => setMobileOpen(false)}>
                <Button className="w-full bg-gradient-to-r from-blue-600 to-violet-600 text-white">
                  play now
                </Button>
              </Link>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
            <p className="text-[10px] text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-3">
              Appearance
            </p>
            <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl">
              {["light", "dark", "system"].map((m) => (
                <button
                  key={m}
                  onClick={() => setTheme(m)}
                  className={`text-[10px] py-2 rounded-lg capitalize transition ${
                    theme === m
                      ? "bg-white dark:bg-sky-500 text-sky-600 dark:text-white shadow-sm"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
