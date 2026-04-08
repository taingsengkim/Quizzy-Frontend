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
                        className={`text-[7px] uppercase font-bold text-center ${req.test ? "text-violet-400" : "text-slate-700"}`}
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
