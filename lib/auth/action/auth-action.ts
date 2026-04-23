"use server";
import { cookies, headers } from "next/headers";
import { auth } from "../auth";
import { redirect } from "next/navigation";

export const signInSocial = async (provider: "github" | "google") => {
  const { url } = await auth.api.signInSocial({
    body: {
      provider,
      callbackURL: "/auth/callback",
    },
  });

  if (url) {
    redirect(url);
  }
  return null;
};

export const signOut = async () => {
  const result = await auth.api.signOut({ headers: await headers() });
  const cookieStore = await cookies();
  // Delete all Better Auth related cookies
  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");

  return result;
};

export const signOutUser = async () => {
  const cookieStore = await cookies();

   cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
};