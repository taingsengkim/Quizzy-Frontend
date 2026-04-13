"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Loader2, User, Lock, CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  currentUsername: string;
  currentAvatar?: string;
  onSaved?: () => void;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export default function EditProfileModal({
  open,
  onClose,
  currentUsername,
  currentAvatar,
  onSaved,
}: EditProfileModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState(currentUsername);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    currentAvatar ?? null,
  );
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const processImageFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Only image files are allowed");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be under 5 MB.");
        return;
      }
      const b64 = await fileToBase64(file);
      setAvatarBase64(b64);
      setAvatarPreview(b64);
    },
    [toast],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) processImageFile(file);
    },
    [processImageFile],
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const removeAvatar = () => {
    setAvatarBase64(null);
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // submit
  const handleSave = async () => {
    if (password && password !== confirmPassword) {
      toast.error("Password doesn't match!");
      return;
    }
    if (password && password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    const body: Record<string, string> = {};
    if (username.trim() && username !== currentUsername)
      body.username = username.trim();
    if (password) body.password = password;
    if (avatarBase64) body.avatar = avatarBase64;

    if (Object.keys(body).length === 0) {
      toast.warning("No changes detected.");
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem("accessToken") ?? "";
      const res = await fetch("/api/v1/auth/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message ?? "Failed to update profile");
      }

      toast.success("Your changes have been saved.");
      onSaved?.();
      onClose();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  // -------- reset on close --------
  const handleClose = () => {
    setUsername(currentUsername);
    setPassword("");
    setConfirmPassword("");
    setAvatarPreview(currentAvatar ?? null);
    setAvatarBase64(null);
    onClose();
  };

  // -------- render --------
  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md bg-slate-950 border border-slate-800 text-slate-100 font-mono shadow-2xl">
        {/* ── header ── */}
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm font-semibold tracking-widest uppercase text-slate-400">
            <span className="text-emerald-500">~$</span> edit_profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* ── avatar upload zone ── */}
          <div className="flex flex-col items-center gap-3">
            <div
              className={`relative w-24 h-24 rounded-full border-2 transition-colors duration-200 cursor-pointer group
                ${
                  isDragging
                    ? "border-emerald-400 shadow-lg shadow-emerald-500/30"
                    : "border-slate-700 hover:border-slate-500"
                }`}
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              title="Click or drag to upload avatar"
            >
              {avatarPreview ? (
                <Image
                  src={avatarPreview}
                  alt="Avatar preview"
                  width={96}
                  height={96}
                  className="rounded-full object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center">
                  <User className="w-8 h-8 text-slate-600" />
                </div>
              )}

              {/* overlay */}
              <div className="absolute inset-0 rounded-full bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                <Camera className="w-5 h-5 text-emerald-400" />
                <span className="text-[9px] text-emerald-400 uppercase tracking-widest">
                  upload
                </span>
              </div>

              {/* remove button */}
              {avatarPreview && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeAvatar();
                  }}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-600 hover:bg-rose-500 flex items-center justify-center transition-colors z-10"
                  title="Remove avatar"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              )}
            </div>

            <p className="text-[10px] text-slate-600">
              click or drag &amp; drop · max 5 MB
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* ── username ── */}
          <div className="space-y-1.5">
            <Label
              htmlFor="username"
              className="text-[10px] uppercase tracking-widest text-slate-500"
            >
              <User className="inline w-3 h-3 mr-1 mb-0.5" />
              username
            </Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-700 focus-visible:ring-emerald-500/40 focus-visible:border-emerald-600 font-mono text-sm h-9"
              placeholder="new_username"
              autoComplete="off"
            />
          </div>

          {/* ── password ── */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className="text-[10px] uppercase tracking-widest text-slate-500"
              >
                <Lock className="inline w-3 h-3 mr-1 mb-0.5" />
                new password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-700 focus-visible:ring-emerald-500/40 focus-visible:border-emerald-600 font-mono text-sm h-9 pr-16"
                  placeholder="leave blank to keep current"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-slate-500 hover:text-slate-300 uppercase tracking-widest transition-colors"
                >
                  {showPass ? "hide" : "show"}
                </button>
              </div>
            </div>

            {password && (
              <div className="space-y-1.5">
                <Label
                  htmlFor="confirmPassword"
                  className="text-[10px] uppercase tracking-widest text-slate-500"
                >
                  confirm password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPass ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-700 focus-visible:ring-emerald-500/40 font-mono text-sm h-9 pr-8
                      ${
                        confirmPassword && password !== confirmPassword
                          ? "border-rose-600/60 focus-visible:border-rose-600"
                          : ""
                      }
                      ${
                        confirmPassword && password === confirmPassword
                          ? "border-emerald-600/60 focus-visible:border-emerald-600"
                          : ""
                      }
                    `}
                    placeholder="repeat new password"
                    autoComplete="new-password"
                  />
                  {confirmPassword && password === confirmPassword && (
                    <CheckCircle2 className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-500" />
                  )}
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-[10px] text-rose-500">
                    // passwords do not match
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── footer ── */}
        <DialogFooter className="gap-2 flex-row justify-end pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={saving}
            className="text-slate-500 hover:text-slate-300 hover:bg-slate-800 font-mono text-xs uppercase tracking-widest h-8"
          >
            cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-mono font-bold text-xs uppercase tracking-widest h-8 px-5 transition-colors"
          >
            {saving ? (
              <>
                <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                saving...
              </>
            ) : (
              "save changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
