"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useLoginMutation,
  useRegisterMutation,
} from "@/lib/auth/api-auth/authSlice";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Connecting social account...");

  const [login] = useLoginMutation();
  const [register] = useRegisterMutation();

  useEffect(() => {
    const run = async () => {
      try {
        // 1. Get social user from session
        setStatus("Fetching session...");
        const res = await fetch("/api/auth/session", {
          credentials: "include",
        });

        const session = await res.json();
        console.log("[AuthCallback] Session:", session);

        if (!session?.user) {
          console.warn("[AuthCallback] No user in session");
          router.push("/login");
          return;
        }

        const { email, name } = session.user;
        const provider = session.user?.accounts?.[0]?.provider ?? "social";

        // Sanitize username: remove spaces, lowercase, fallback to email prefix
        const username = email.split("@")[0];

        // Use a deterministic password that satisfies your schema requirements
        // Uppercase + lowercase + number + special char
        const password = `Social_${email}_1!`;

        console.log("[AuthCallback] Attempting login for:", email);

        try {
          const loginResult = await login({ email, password }).unwrap();
          console.log("[AuthCallback] Login result:", loginResult);
          // Only consider it a real success if Spring returned a token
          if (loginResult?.accessToken) {
            router.push("/");
            return;
          }
          // No token = user doesn't exist in Spring yet
          console.warn("[AuthCallback] No accessToken, proceeding to register");
        } catch (loginErr: any) {
          console.warn("[AuthCallback] Login failed:", loginErr?.data?.message);
        }
        // 3. Register the user
        console.log("[AuthCallback] Attempting register with:", {
          email,
          username,
          role: "STUDENT",
        });

        try {
          const registerResult = await register({
            email,
            username,
            password,
            role: "STUDENT",
          }).unwrap();
          console.log("[AuthCallback] Register successful:", registerResult);
        } catch (registerErr) {
          // This is where you'll now see the actual error
          //   console.error("[AuthCallback] Register failed:", registerErr);
          //   setStatus(`Registration failed. Check console for details.`);
          return;
        }

        // 4. Login after successful registration
        try {
          await login({ email, password }).unwrap();
          console.log("[AuthCallback] Post-register login successful");
          router.push("/");
        } catch (finalLoginErr) {
          console.error(
            "[AuthCallback] Post-register login failed:",
            finalLoginErr,
          );
          router.push("/login");
        }
      } catch (err) {
        console.error("[AuthCallback] Unexpected error:", err);
        router.push("/login");
      }
    };

    run();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen text-white bg-[#02040a]">
      <p className="font-mono text-sm">{status}</p>
    </div>
  );
}
