"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  ShieldCheck,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegisterMutation } from "@/lib/auth/api-auth/authSlice";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters."),
  email: z.string().email("Invalid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .regex(/[A-Z]/, "Must include at least one uppercase letter.")
    .regex(/[a-z]/, "Must include at least one lowercase letter.")
    .regex(/[0-9]/, "Must include at least one number.")
    .regex(/[^A-Za-z0-9]/, "Must include at least one special character."),
  role: z.enum(["STUDENT", "INSTRUCTOR"]),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterComponent() {
  const [showPassword, setShowPassword] = useState(false);
  const [registerUser, { isLoading }] = useRegisterMutation();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "kim12333",
      email: "kim040322@gmail.com",
      password: "Kim123!@#",
      role: "STUDENT",
    },
  });

  const router = useRouter();

  const onSubmit = async (values: RegisterFormValues) => {
    const toastId = toast.loading("Initializing Account...", {
      description: "Syncing credentials with the secure node.",
      className: "font-mono text-[11px] uppercase tracking-wider",
    });
    try {
      await registerUser(values).unwrap();
      toast.success("Account Created", {
        id: toastId,
        description: "Neural link established. Redirecting to login...",
        className: "bg-slate-900 border-sky-500/50 text-white font-mono",
        icon: <ShieldCheck className="w-4 h-4 text-sky-400" />,
      });
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: any) {
      toast.error("Protocol Failed", {
        id: toastId,
        description:
          err?.data?.message || "Email already registered or server error.",
        className: "bg-slate-950 border-red-500/50 text-white font-mono",
      });
      console.error("Auth Error:", err);
    }
  };

  const passwordValue = watch("password");

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#02040a] text-slate-200 px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="bg-slate-950/50 border-slate-800 backdrop-blur-2xl shadow-2xl overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-sky-400 to-violet-500" />
          <CardContent className="p-8 space-y-8">
            <header className="space-y-2 text-center">
              <h1 className="text-4xl font-black tracking-tighter italic text-white italic">
                QUIZ
                <span className="text-sky-500 underline decoration-violet-500">
                  ZY
                </span>
              </h1>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em]">
                System.Initialize(Account_Creation)
              </p>
            </header>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="p-1 bg-slate-900/80 rounded-xl border border-slate-800 flex gap-1">
                <Controller
                  control={control}
                  name="role"
                  render={({ field }) => (
                    <>
                      {["STUDENT", "INSTRUCTOR"].map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => field.onChange(role)}
                          className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${
                            field.value === role
                              ? "bg-slate-800 text-sky-400 shadow-inner"
                              : "text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          {role}
                        </button>
                      ))}
                    </>
                  )}
                />
              </div>
              {[
                {
                  name: "username",
                  label: "Codename",
                  icon: User,
                  placeholder: "ghost_protocol",
                  type: "text",
                },
                {
                  name: "email",
                  label: "Neural Link (Email)",
                  icon: Mail,
                  placeholder: "user@domain.com",
                  type: "email",
                },
              ].map((input) => (
                <div key={input.name} className="space-y-1.5 group">
                  <Label className="text-[10px] font-mono text-slate-500 ml-1 group-focus-within:text-sky-400 transition-colors">
                    {input.label}
                  </Label>
                  <div className="relative">
                    <input.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-sky-500 transition-colors" />
                    <Controller
                      control={control}
                      name={input.name as any}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder={input.placeholder}
                          className="text-white  pl-10 bg-slate-900/50 border-slate-800 focus:border-sky-500/50 focus:ring-sky-500/20 placeholder:text-slate-700 transition-all"
                        />
                      )}
                    />
                  </div>
                  <ErrorMessage
                    message={
                      errors[input.name as keyof RegisterFormValues]?.message
                    }
                  />
                </div>
              ))}
              {/* PASSWORD */}
              <div className="space-y-1.5 group">
                <Label className="text-[10px] font-mono text-slate-500 ml-1 group-focus-within:text-violet-400 uppercase">
                  Access Key
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-violet-500 transition-colors" />
                  <Controller
                    control={control}
                    name="password"
                    render={({ field }) => (
                      <Input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="text-white pl-10 pr-10 bg-slate-900/50 border-slate-800 focus:border-violet-500/50 focus:ring-violet-500/20 transition-all"
                      />
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>

                {/* ⚡ Dynamic Strength Meter */}
                <div className="flex gap-1.5 mt-2 px-1">
                  {[
                    { label: "Length", test: passwordValue.length >= 8 },
                    { label: "Upper", test: /[A-Z]/.test(passwordValue) },
                    { label: "Number", test: /[0-9]/.test(passwordValue) },
                    {
                      label: "Special",
                      test: /[^A-Za-z0-9]/.test(passwordValue),
                    },
                  ].map((req, i) => (
                    <div key={i} className="flex-1 space-y-1">
                      <div
                        className={`h-1 rounded-full transition-all duration-500 ${
                          req.test
                            ? "bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]"
                            : "bg-slate-800"
                        }`}
                      />
                      {/* Optional: Tiny label for each bar */}
                      <p
                        className={`text-[7px] uppercase font-bold text-center ${
                          req.test ? "text-violet-400" : "text-slate-700"
                        }`}
                      >
                        {req.label}
                      </p>
                    </div>
                  ))}
                </div>

                <ErrorMessage message={errors.password?.message} />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full relative group h-11 bg-white text-black hover:bg-white/90 font-bold overflow-hidden"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    <span className="relative z-10 flex items-center">
                      EXECUTE REGISTER{" "}
                      <Zap className="ml-2 w-4 h-4 fill-current" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-violet-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </>
                )}
              </Button>
              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => {}}
                  className="flex items-center justify-center gap-2.5 w-full py-2.5 bg-slate-900/50 border border-slate-800 hover:border-sky-500/40 rounded-xl text-slate-200 text-sm font-medium transition-all active:scale-[0.98]"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continue with Google
                </button>

                <button
                  type="button"
                  onClick={() => {}}
                  className="flex items-center justify-center gap-2.5 w-full py-2.5 bg-slate-900/50 border border-slate-800 hover:border-violet-500/40 rounded-xl text-slate-200 text-sm font-medium transition-all active:scale-[0.98]"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  Continue with GitHub
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-800" />
                <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">
                  or use credentials
                </span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>
            </form>

            <footer className="text-center">
              <p className="text-[10px] text-slate-600 font-mono italic">
                Existing_Node?{" "}
                <span className="text-sky-500 hover:text-sky-300 underline cursor-pointer">
                  Re-route to Login
                </span>
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
          className="text-[9px] text-red-500 font-bold uppercase tracking-tighter mt-1"
        >
          {`> ERROR: ${message}`}
        </motion.p>
      )}
    </AnimatePresence>
  );
}
