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
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    currentAvatar ?? null,
  );
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const processImageFile = useCallback(async (file: File) => {
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
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processImageFile(file);
  }, []);

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

  // ---------------- SAVE ----------------
  const handleSave = async () => {
    if (password && password !== confirmPassword) {
      toast.error("Password doesn't match!");
      return;
    }

    if (password && password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    // 🔥 require old password if changing password
    if (password && !oldPassword) {
      toast.error("Old password is required");
      return;
    }

    const body: Record<string, string> = {};

    if (username.trim() && username !== currentUsername) {
      body.username = username.trim();
    }

    if (password) {
      body.password = password;
      body.oldPassword = oldPassword;
    }

    if (avatarBase64) {
      body.avatar = avatarBase64;
    }

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

      toast.success("Profile updated successfully");
      onSaved?.();
      onClose();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ---------------- RESET ----------------
  const handleClose = () => {
    setUsername(currentUsername);
    setOldPassword("");
    setPassword("");
    setConfirmPassword("");
    setAvatarPreview(currentAvatar ?? null);
    setAvatarBase64(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md bg-slate-950 border border-slate-800 text-slate-100 font-mono">
        <DialogHeader>
          <DialogTitle className="text-slate-400 uppercase text-xs">
            edit_profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div
              className={`relative w-24 h-24 rounded-full border-2 cursor-pointer ${
                isDragging ? "border-emerald-400" : "border-slate-700"
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {avatarPreview ? (
                <Image
                  src={avatarPreview}
                  alt="avatar"
                  width={96}
                  height={96}
                  className="rounded-full object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-800 rounded-full">
                  <User className="text-slate-600" />
                </div>
              )}

              {avatarPreview && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeAvatar();
                  }}
                  className="absolute -top-1 -right-1 bg-rose-600 w-5 h-5 rounded-full flex items-center justify-center"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          {/* Username */}
          <div>
            <Label>username</Label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* Old password */}
          <div>
            <Label>old password</Label>
            <Input
              type={showPass ? "text" : "password"}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="required if changing password"
            />
          </div>

          {/* New password */}
          <div>
            <Label>new password</Label>
            <Input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="leave empty to keep current"
            />
          </div>

          {/* Confirm */}
          {password && (
            <div>
              <Label>confirm password</Label>
              <Input
                type={showPass ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-rose-500 text-xs">Passwords do not match</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter>
          <Button variant="ghost" onClick={handleClose}>
            cancel
          </Button>

          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="animate-spin w-4 h-4 mr-2" />
                saving
              </>
            ) : (
              "save"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
