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
import {
  Loader2,
  User,
  X,
  Upload,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  currentUsername: string;
  currentAvatar?: string;
  onSaved?: () => void;
}

const IMGBB_API_KEY = "c36df12c246b46f041dd3629832b6457";

async function uploadToImgbb(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(
    `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
    { method: "POST", body: formData },
  );

  if (!res.ok) throw new Error("Image upload failed");

  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message ?? "Upload failed");

  // Returns the direct image URL (permanent, no expiry on free tier)
  return data.data.url as string;
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
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    currentAvatar ?? null,
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [saving, setSaving] = useState(false);

  // ── avatar helpers ─────────────────────────────────────────────────────────
  const processImageFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB.");
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }, []);

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

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (password && password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    if (password && password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password && !oldPassword) {
      toast.error("Old password is required");
      return;
    }

    const body: Record<string, string> = {};

    if (username.trim() && username !== currentUsername)
      body.username = username.trim();
    if (password) {
      body.password = password;
      body.oldPassword = oldPassword;
    }

    // Upload avatar to imgbb first, then send URL to your backend
    if (avatarFile) {
      try {
        setUploadingAvatar(true);
        const url = await uploadToImgbb(avatarFile);
        body.avatar = url;
      } catch (err: any) {
        toast.error("Avatar upload failed: " + err.message);
        setUploadingAvatar(false);
        return;
      } finally {
        setUploadingAvatar(false);
      }
    }

    if (Object.keys(body).length === 0) {
      toast.warning("No changes detected");
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem("accessToken") ?? "";

      const res = await fetch("/api/profile", {
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

      toast.success("Profile updated");
      onSaved?.();
      onClose();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── reset on close ─────────────────────────────────────────────────────────
  const handleClose = () => {
    setUsername(currentUsername);
    setOldPassword("");
    setPassword("");
    setConfirmPassword("");
    setAvatarPreview(currentAvatar ?? null);
    setAvatarFile(null);
    onClose();
  };

  const passwordsMatch =
    !password || !confirmPassword || password === confirmPassword;
  const isBusy = saving || uploadingAvatar;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-sm p-0 gap-0 border-0 bg-transparent shadow-none overflow-visible">
        {/* ── card ─────────────────────────────────────────────────────────── */}
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(145deg, #0d1117 0%, #0a0f18 100%)",
            border: "1px solid rgba(255,255,255,0.06)",
            boxShadow:
              "0 0 0 1px rgba(16,185,129,0.08), 0 32px 64px -16px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          {/* subtle top accent bar */}
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(16,185,129,0.5), transparent)",
            }}
          />

          {/* ── header ────────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <div>
              <p className="text-[10px] tracking-[0.2em] text-emerald-500 font-mono uppercase mb-0.5">
                system
              </p>
              <h2 className="text-sm font-mono font-medium text-slate-200 tracking-wide">
                edit_profile
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="w-7 h-7 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div
            className="h-px mx-6"
            style={{ background: "rgba(255,255,255,0.05)" }}
          />

          {/* ── body ──────────────────────────────────────────────────────── */}
          <div className="px-6 py-5 space-y-5">
            {/* Avatar upload */}
            <div className="flex items-center gap-4">
              <div
                className="relative w-16 h-16 rounded-full cursor-pointer flex-shrink-0 group"
                style={{
                  border: isDragging
                    ? "2px dashed rgba(16,185,129,0.8)"
                    : "2px dashed rgba(255,255,255,0.1)",
                  transition: "border-color 0.2s",
                }}
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
              >
                {avatarPreview ? (
                  <>
                    <Image
                      src={avatarPreview}
                      alt="avatar"
                      width={64}
                      height={64}
                      className="rounded-full object-cover w-full h-full"
                    />
                    {/* hover overlay */}
                    <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Upload className="w-4 h-4 text-white" />
                    </div>
                    {/* remove button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeAvatar();
                      }}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-600 hover:bg-rose-500 flex items-center justify-center transition-colors z-10"
                    >
                      <X className="w-2.5 h-2.5 text-white" />
                    </button>
                  </>
                ) : (
                  <div className="w-full h-full rounded-full flex flex-col items-center justify-center gap-1 bg-slate-900">
                    <User className="w-5 h-5 text-slate-600" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400 font-mono mb-1">
                  profile photo
                </p>
                <p className="text-[11px] text-slate-600 font-mono leading-relaxed">
                  {avatarFile ? (
                    <span className="text-emerald-500 truncate block">
                      {avatarFile.name}
                    </span>
                  ) : (
                    "click or drag to upload · max 5 MB"
                  )}
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                hidden
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>

            <div
              className="h-px"
              style={{ background: "rgba(255,255,255,0.04)" }}
            />

            {/* Username */}
            <Field label="username">
              <MonoInput
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={currentUsername}
              />
            </Field>

            {/* Old password */}
            <Field label="current password">
              <MonoInput
                type={showPass ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="required to change password"
                suffix={
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="text-slate-600 hover:text-slate-400 transition-colors"
                  >
                    {showPass ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                }
              />
            </Field>

            {/* New password */}
            <Field label="new password">
              <MonoInput
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="leave blank to keep current"
              />
            </Field>

            {/* Confirm */}
            {password && (
              <Field label="confirm password">
                <MonoInput
                  type={showPass ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="repeat new password"
                  suffix={
                    confirmPassword ? (
                      passwordsMatch ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                      )
                    ) : null
                  }
                />
                {!passwordsMatch && (
                  <p className="mt-1 text-[11px] text-rose-500 font-mono">
                    passwords do not match
                  </p>
                )}
              </Field>
            )}
          </div>

          {/* ── footer ────────────────────────────────────────────────────── */}
          <div
            className="px-6 py-4 flex items-center justify-end gap-3"
            style={{
              borderTop: "1px solid rgba(255,255,255,0.05)",
              background: "rgba(0,0,0,0.2)",
            }}
          >
            <button
              onClick={handleClose}
              className="text-xs font-mono text-slate-500 hover:text-slate-300 transition-colors px-3 py-1.5"
            >
              cancel
            </button>

            <button
              onClick={handleSave}
              disabled={isBusy}
              className="relative flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-mono font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: isBusy
                  ? "rgba(16,185,129,0.1)"
                  : "rgba(16,185,129,0.15)",
                border: "1px solid rgba(16,185,129,0.3)",
                color: "#34d399",
                boxShadow: isBusy ? "none" : "0 0 12px rgba(16,185,129,0.1)",
              }}
              onMouseEnter={(e) => {
                if (!isBusy) {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "rgba(16,185,129,0.25)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    "0 0 20px rgba(16,185,129,0.2)";
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "rgba(16,185,129,0.15)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 0 12px rgba(16,185,129,0.1)";
              }}
            >
              {isBusy && <Loader2 className="animate-spin w-3 h-3" />}
              {uploadingAvatar
                ? "uploading..."
                : saving
                ? "saving..."
                : "save changes"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── tiny helpers ───────────────────────────────────────────────────────────────

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] tracking-[0.15em] uppercase font-mono text-slate-500">
        {label}
      </label>
      {children}
    </div>
  );
}

function MonoInput({
  suffix,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { suffix?: React.ReactNode }) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-lg"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        transition: "border-color 0.2s",
      }}
      onFocusCapture={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor =
          "rgba(16,185,129,0.4)";
      }}
      onBlurCapture={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor =
          "rgba(255,255,255,0.08)";
      }}
    >
      <input
        {...props}
        className="flex-1 bg-transparent text-xs font-mono text-slate-200 placeholder:text-slate-600 outline-none min-w-0"
      />
      {suffix}
    </div>
  );
}
