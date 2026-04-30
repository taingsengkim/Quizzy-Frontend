"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion"; // Add this
import { Zap, Eye, EyeOff, Mail, Lock, Loader2, KeyRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLoginMutation } from "@/lib/auth/api-auth/authSlice";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import SocialAuthButtons from "./social-login-button";
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginComponent() {
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [userLogin, { isLoading }] = useLoginMutation();
  const router = useRouter();
  async function onSubmit(values: LoginFormValues) {
    const toastId = toast.loading("Authenticating system...", {
      description: "Verifying neural link credentials.",
      className: "font-mono text-[11px] uppercase tracking-wider",
    });

    try {
      await userLogin(values).unwrap();

      toast.success("Access Granted", {
        id: toastId,
        description: "Welcome back, Operator. Redirecting to core.",
        className: "bg-slate-900 border-sky-500/50 text-white font-mono",
        icon: <Zap className="w-4 h-4 text-sky-400 fill-current" />,
      });
      setTimeout(() => {
        router.push("/");
      }, 500);
    } catch (err: any) {
      toast.error("Access Denied", {
        id: toastId,
        description: err?.data?.message || "Invalid credentials provided.",
        className: "bg-slate-950 border-red-500/50 text-white font-mono",
      });
      console.error("Login API error:", err);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center 
                bg-white dark:bg-[#02040a] 
                text-slate-900 dark:text-slate-200 
                px-6 relative overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] 
                    bg-blue-500/10 dark:bg-blue-600/10 
                    blur-[120px] rounded-full"
        />

        <div
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] 
                    bg-violet-500/10 dark:bg-violet-600/10 
                    blur-[120px] rounded-full"
        />

        <div
          className="absolute inset-0 
                    bg-[url('https://grainy-gradients.vercel.app/noise.svg')] 
                    opacity-10 dark:opacity-20 mix-blend-overlay"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card
          className="backdrop-blur-2xl shadow-2xl overflow-hidden
                 bg-white/70 dark:bg-slate-950/50
                 border border-slate-200 dark:border-slate-800"
        >
          <div
            className="h-1 w-full 
                      bg-gradient-to-r from-blue-500 via-sky-400 to-violet-500"
          />

          <CardContent className="p-8 space-y-8">
            <header className="space-y-2 text-center">
              <h1
                className="text-4xl font-black tracking-tighter italic
                         text-slate-900 dark:text-white
                         underline decoration-sky-500 decoration-4"
              >
                QUIZ<span className="text-sky-500">ZY</span>
              </h1>

              <p
                className="text-[10px] font-mono uppercase tracking-[0.3em] 
                        text-slate-500 dark:text-slate-500"
              >
                System.Initialize(Authentication)
              </p>
            </header>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-1.5 group">
                <Label
                  className="text-[10px] font-mono ml-1 uppercase
                              text-slate-500 group-focus-within:text-sky-500 transition-colors"
                >
                  Neural Link (Email)
                </Label>

                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 
                               w-4 h-4 text-slate-400 
                               group-focus-within:text-sky-500 transition-colors"
                  />

                  <Controller
                    control={control}
                    name="email"
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="email"
                        placeholder="user@domain.com"
                        className={`pl-10 transition-all
                      bg-white dark:bg-slate-900/50
                      text-slate-900 dark:text-white
                      border
                      ${
                        errors.email
                          ? "border-red-500"
                          : "border-slate-300 dark:border-slate-800 hover:border-sky-400/50"
                      }
                      focus:border-sky-500/50 focus:ring-sky-500/20`}
                      />
                    )}
                  />
                </div>

                <ErrorMessage message={errors.email?.message} />
              </div>
              <div className="space-y-1.5 group">
                <Label
                  className="text-[10px] font-mono uppercase ml-1
                              text-slate-500 group-focus-within:text-violet-500"
                >
                  Access Key
                </Label>

                <div className="relative">
                  <KeyRound
                    className="absolute left-3 top-1/2 -translate-y-1/2 
                                   w-4 h-4 text-slate-400 
                                   group-focus-within:text-violet-500 transition-colors"
                  />

                  <Controller
                    control={control}
                    name="password"
                    render={({ field }) => (
                      <Input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className={`pl-10 pr-10 transition-all
                      bg-white dark:bg-slate-900/50
                      text-slate-900 dark:text-white
                      border
                      ${
                        errors.password
                          ? "border-red-500"
                          : "border-slate-300 dark:border-slate-800 hover:border-violet-400/50"
                      }
                      focus:border-violet-500/50 focus:ring-violet-500/20`}
                      />
                    )}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 
                           text-slate-400 hover:text-slate-600 
                           dark:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>

                <ErrorMessage message={errors.password?.message} />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 font-bold relative overflow-hidden
                       bg-black dark:bg-white 
                       text-white dark:text-black
                       hover:opacity-90 active:scale-[0.98]"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    <span className="relative z-10 flex items-center">
                      EXECUTE LOGIN <Zap className="ml-2 w-4 h-4" />
                    </span>
                  </>
                )}
              </Button>

              <SocialAuthButtons />
            </form>
            <footer className="text-center">
              <p className="text-[10px] font-mono italic text-slate-500">
                Unauthorized_Node?{" "}
                <Link
                  href="/register"
                  className="text-sky-500 hover:text-sky-400 underline underline-offset-4"
                >
                  Create Account
                </Link>
              </p>
            </footer>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
function ErrorMessage({ message }: { message?: string }) {
  return (
    <AnimatePresence mode="wait">
      {message && (
        <motion.p
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="text-[9px] text-red-500 font-bold uppercase tracking-tighter mt-1"
        >
          {`> ERROR: ${message}`}
        </motion.p>
      )}
    </AnimatePresence>
  );
}
