"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Lock, Mail, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useLoginMutation } from "@/lib/auth/api-auth/authSlice";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import loginAdmin from "@/lib/auth/admin-auth";

const loginSchema = z.object({
  email: z.email("Invalid admin email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValue = z.infer<typeof loginSchema>;

export default function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValue>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "kim040322@gmail.com",
      password: "Kim123!@#",
    },
  });
  const router = useRouter();
  const setCookie = (name: string, value: string, days: number) => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
  };
  const onFormSubmit = async (data: LoginFormValue) => {
    setIsLoading(true);
    try {
      const result = await loginAdmin(data);
      console.log(result);
      router.push("/admin/dashboard");
    } catch (err: any) {
      console.error("Spring Boot Login failed:", err);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[30%] h-[30%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <Card className="w-full max-w-md shadow-2xl border-muted/50 backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 z-10">
        <CardHeader className="space-y-1 text-center pb-6">
          <div className="mx-auto bg-primary w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
            <ShieldCheck className="w-7 h-7 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Admin Access
          </CardTitle>
          <CardDescription>
            Secure login for dashboard management
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className={errors.email ? "text-destructive" : ""}
              >
                Admin Email
              </Label>
              <div className="relative">
                <Mail
                  className={`absolute left-3 top-3 h-4 w-4 ${errors.email ? "text-destructive" : "text-muted-foreground"}`}
                />
                <Controller
                  control={control}
                  name="email"
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="email"
                      placeholder="name@company.com"
                      className={`pl-10 ${errors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    />
                  )}
                />
              </div>
              {errors.email && (
                <p className="text-[10px] font-medium text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className={errors.password ? "text-destructive" : ""}
                >
                  Password
                </Label>
                <button
                  type="button"
                  className="text-xs text-primary hover:underline underline-offset-4"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <Lock
                  className={`absolute left-3 top-3 h-4 w-4 ${errors.password ? "text-destructive" : "text-muted-foreground"}`}
                />
                <Controller
                  control={control}
                  name="password"
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="password"
                      type={showPassword ? "text" : "password"}
                      className={`pl-10 ${errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    />
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-[10px] font-medium text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 group mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </div>
              ) : (
                <span className="flex items-center gap-2">
                  Authorize & Sign In
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center border-t border-muted/50 bg-muted/20 py-4 rounded-b-lg">
          <p className="text-[11px] text-muted-foreground text-center max-w-[250px] leading-tight">
            Security Notice: Unauthorized access attempts are strictly monitored
            and logged by system security.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
