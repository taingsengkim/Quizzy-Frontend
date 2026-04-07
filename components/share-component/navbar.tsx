"use client";

import React from "react";
import { Button } from "../ui/button";
import {
  ArrowRight,
  LogOut,
  User,
  Settings,
  LayoutDashboard,
  Loader2,
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
  const { data: user, isLoading } = useGetProfileQuery();
  const router = useRouter();

  const handleLogout = () => {
    toast.success("Session Terminated", {
      description: "Successfully logged out of the neural link.",
    });
    router.push("/login");
  };

  return (
    <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 bg-[#080b14]/80 backdrop-blur-xl border-b border-sky-500/10">
      {/* Logo */}
      <Link href="/" className="group">
        <span className="font-display text-xl font-extrabold tracking-tight text-white transition-all">
          quiz<span className="text-sky-400">zy</span>
          <span className="text-violet-500 group-hover:animate-pulse">_</span>
        </span>
      </Link>

      {/* Links */}
      <div className="hidden md:flex items-center gap-8 text-[11px] text-slate-500 tracking-[0.18em] uppercase font-mono">
        <Link href="/" className="hover:text-sky-400 transition-colors">
          Home
        </Link>
        <Link href="/quizzes" className="hover:text-sky-400 transition-colors">
          Quizzes
        </Link>
        <Link
          href="/leaderboard"
          className="hover:text-sky-400 transition-colors"
        >
          Leaderboard
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4">
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger className="focus:outline-none group">
                <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-sky-500 to-violet-500 group-hover:shadow-[0_0_15px_rgba(56,189,248,0.4)] transition-all">
                  <Avatar className="h-8 w-8 border-2 border-[#080b14]">
                    <AvatarImage src={user.avatar} alt={user.username} />
                    <AvatarFallback className="bg-slate-900 text-sky-400 text-[10px]">
                      {user.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="w-56 bg-slate-950 border-slate-800 text-slate-300 mt-2 backdrop-blur-xl shadow-2xl"
                align="end"
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold text-white leading-none">
                      {user.username}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono leading-none">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-800" />
                <DropdownMenuItem
                  onSelect={() => router.push("/profile")}
                  className="cursor-pointer focus:bg-sky-500/10 focus:text-sky-400"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile Detail</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onSelect={() => router.push("/dashboard")}
                  className="cursor-pointer focus:bg-sky-500/10 focus:text-sky-400"
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>

                <DropdownMenuItem className="cursor-pointer focus:bg-sky-500/10 focus:text-sky-400">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-slate-800" />

                <DropdownMenuItem
                  onClick={signOutUser}
                  className="cursor-pointer text-red-400 focus:bg-red-500/10 focus:text-red-400"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Terminate Session</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-slate-400 "
              >
                login
              </Button>
            </Link>
            <Link href="/register">
              <Button
                size="sm"
                className="text-xs bg-gradient-to-r from-blue-600 to-violet-600 shadow-[0_0_20px_rgba(37,99,235,0.3)]"
              >
                play now <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
