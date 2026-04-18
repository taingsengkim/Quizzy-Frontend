"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { AlertTriangle, Trash2 } from "lucide-react";

type DeleteType = "quiz" | "category";

export default function DeleteModal({
  item,
  onConfirm,
  onCancel,
  type,
}: {
  item: any;
  onConfirm: () => void;
  onCancel: () => void;
  type: DeleteType;
}) {
  const [open, setOpen] = useState(true);

  const handleClose = (open: boolean) => {
    setOpen(open);
    if (!open) onCancel();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-slate-950 border border-red-500/20 text-white">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-5 h-5" />
            <DialogTitle className="text-lg font-bold">
              Delete {type === "quiz" ? "Quiz" : "Category"}
            </DialogTitle>
          </div>

          <p className="text-xs text-slate-400">
            This action is permanent and cannot be undone.
          </p>
        </DialogHeader>

        <div className="mt-4 space-y-3 rounded-lg border border-slate-800 bg-slate-900/40 p-4">
          {type === "category" ? (
            <>
              <h2 className="text-lg font-semibold text-white">{item.name}</h2>
              <p className="text-sm text-slate-400">{item.description}</p>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-white">{item.title}</h2>
              <p className="text-sm text-slate-400">{item.description}</p>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button
            variant="outline"
            onClick={onCancel}
            className="border-slate-700 text-black hover:text-white hover:bg-slate-800"
          >
            Cancel
          </Button>

          <Button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
