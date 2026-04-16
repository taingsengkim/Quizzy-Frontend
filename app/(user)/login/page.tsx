import LoginComponent from "@/components/user-page/login";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";

export default async function LoginPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  console.log("session", session);
  return <LoginComponent />;
}
