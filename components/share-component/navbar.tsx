"use client";

import React, { useState } from "react";
import { Button } from "../ui/button";
import {
  ArrowRight,
  LogOut,
  User,
  Settings,
  LayoutDashboard,
  Menu,
  X,
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
import { toast } from "sonner";
import { signOutUser } from "@/lib/auth/action/auth-action";

export default function Navbar() {
  const { data: user } = useGetProfileQuery();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/quizzes", label: "Quizzes" },
    { href: "/leaderboard", label: "Leaderboard" },
  ];

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-[#080b14]/80 backdrop-blur-xl border-b border-sky-500/10">
      <div className="flex items-center justify-between px-6 md:px-10 py-4">
        <Link href="/" className="group">
          <span className="font-display text-xl font-extrabold text-white">
            quiz<span className="text-sky-400">zy</span>
            <span className="text-violet-500 group-hover:animate-pulse">_</span>
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-[11px] text-slate-500 tracking-[0.18em] uppercase font-mono">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-sky-400 transition"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger className="focus:outline-none">
                <Avatar className="h-8 w-8 border border-sky-500/40">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="bg-slate-900 text-sky-400 text-xs">
                    {user.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="w-56 bg-slate-950 border-slate-800 text-slate-300 mt-2"
                align="end"
              >
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <p className="text-white font-bold">{user.username}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </DropdownMenuItem>

                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={signOutUser}>
                  <LogOut className="w-4 h-4 mr-2 text-red-400" />
                  <span className="text-red-400">Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-xs">
                  login
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  className="text-xs bg-gradient-to-r from-blue-600 to-violet-600"
                >
                  play now <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
          )}

          <button
            className="md:hidden text-slate-300"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden px-6 pb-5 space-y-4 border-t border-slate-800 bg-[#080b14]/95 backdrop-blur-xl">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block text-slate-400 text-sm py-2 hover:text-sky-400"
            >
              {link.label}
            </Link>
          ))}
          {!user && (
            <div className="flex flex-col gap-2 pt-2">
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" className="w-full">
                  login
                </Button>
              </Link>

              <Link href="/register" onClick={() => setMobileOpen(false)}>
                <Button className="w-full bg-gradient-to-r from-blue-600 to-violet-600">
                  play now
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
