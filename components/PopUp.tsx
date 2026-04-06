"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { QuizResponse } from "@/lib/types/quiz";

export default function DeleteModal({
  quiz,
  onConfirm,
  onCancel,
}: {
  quiz: QuizResponse;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const deleteId = quiz.id;
  const [open, setOpen] = useState(true);

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            <h2>{quiz.title}</h2>
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
