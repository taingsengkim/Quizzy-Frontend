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
import { useDispatch } from "react-redux";
import { quizzy } from "@/lib/features/api/api";

export default function Navbar() {
  const { data: user } = useGetProfileQuery(undefined, {
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/quizzes", label: "Quizzes" },
    { href: "/quizzes/multiplayer/join", label: "Join Room" },
    { href: "/about", label: "About" },
  ];

  const dispatch = useDispatch();

  const handleLogout = async () => {
    await signOutUser();
    dispatch(quizzy.util.resetApiState());
    router.push("/login");
    router.refresh();
  };
  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-[#080b14]/80 backdrop-blur-xl border-b border-sky-500/10">
      <div className="flex items-center justify-between px-6 md:px-10 py-4">
        {/* Logo */}
        <Link href="/" className="group shrink-0">
          <span className="font-display text-xl font-extrabold text-white">
            quiz<span className="text-sky-400">zy</span>
            <span className="text-violet-500 group-hover:animate-pulse">_</span>
          </span>
        </Link>

        {/* Desktop nav links */}
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

        {/* Desktop right side */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Desktop dropdown — hidden on mobile */}
              <div className="hidden md:block">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger className="focus:outline-none">
                    <Avatar className="h-8 w-8 border border-sky-500/40">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="bg-slate-900 text-sky-400 text-xs">
                        {user?.username?.substring(0, 2).toUpperCase()}
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
                      <User className="w-4 h-4 mr-2" /> Profile
                    </DropdownMenuItem>
                    {/* <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                      <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="w-4 h-4 mr-2" /> Settings
                    </DropdownMenuItem> */}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2 text-red-400" />
                      <span className="text-red-400">Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
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

          {/* Hamburger — always visible on mobile */}
          <button
            className="md:hidden text-slate-300 p-1"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden px-6 pb-6 pt-4 space-y-1 border-t border-slate-800 bg-[#080b14]/95 backdrop-blur-xl">
          {/* Nav links */}
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block text-slate-400 text-sm py-2.5 hover:text-sky-400 transition border-b border-slate-800/50"
            >
              {link.label}
            </Link>
          ))}

          {user ? (
            // Logged-in mobile menu
            <div className="pt-4 space-y-1">
              {/* User info */}
              <div className="flex items-center gap-3 py-3 mb-2">
                <Avatar className="h-9 w-9 border border-sky-500/40">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-slate-900 text-sky-400 text-xs">
                    {user?.username?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-white text-sm font-semibold">
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
                className="flex items-center gap-2 w-full text-slate-400 text-sm py-2.5 hover:text-sky-400 transition"
              >
                <User className="w-4 h-4" /> Profile
              </button>

              {/* <button
                onClick={() => {
                  router.push("/dashboard");
                  setMobileOpen(false);
                }}
                className="flex items-center gap-2 w-full text-slate-400 text-sm py-2.5 hover:text-sky-400 transition"
              >
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </button>
              <button className="flex items-center gap-2 w-full text-slate-400 text-sm py-2.5 hover:text-sky-400 transition">
                <Settings className="w-4 h-4" /> Settings
              </button> */}
              <button
                onClick={() => {
                  handleLogout();
                  setMobileOpen(false);
                }}
                className="flex items-center gap-2 w-full text-red-400 text-sm py-2.5 hover:text-red-300 transition mt-2"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          ) : (
            // Guest mobile menu
            <div className="flex flex-col gap-2 pt-4">
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
