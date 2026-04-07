"use server";
import { headers } from "next/headers";
import { auth } from "../auth";
import { redirect } from "next/navigation";

export const signInSocial = async (provider: "github" | "google" | "facebook") => {
  const { url } = await auth.api.signInSocial({
    body: {
      provider,
      callbackURL: "/admin/dashboard",
    },
  });

  if (url) {
    redirect(url);
  }
};

export const signOut = async () => {
  const result = await auth.api.signOut({ headers: await headers() });
  redirect("/admin/login"); 
  return result;
};
export const signOutUser = async () => {
  const result = await auth.api.signOut({ headers: await headers() });
  redirect("/login"); 
  return result;
};

