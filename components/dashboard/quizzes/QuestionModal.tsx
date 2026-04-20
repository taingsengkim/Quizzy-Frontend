"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Loader2 } from "lucide-react";

import QuestionForm, { QuestionFormValues } from "./QuestionForm";
import {
  useAddQuestionToQuizMutation,
  useUpdateQuestionMutation,
} from "@/lib/features/quizzes/quizzesSlice";
import { Question } from "./QuestionCard";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  quizId: string;
  mode: "create" | "edit";
  question?: Question;
};

export default function QuestionModal({
  open,
  onOpenChange,
  quizId,
  mode,
  question,
}: Props) {
  const [addQuestion, { isLoading: creating }] = useAddQuestionToQuizMutation();
  const [updateQuestion, { isLoading: updating }] = useUpdateQuestionMutation();

  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiGenerated, setAiGenerated] = useState<
    Partial<QuestionFormValues> | undefined
  >(undefined);

  const loading = creating || updating;
  const isEdit = mode === "edit";

  const handleSubmit = async (values: QuestionFormValues) => {
    if (isEdit && question) {
      await updateQuestion({ id: question.id, body: values }).unwrap();
    } else {
      await addQuestion({ quizId, ...values }).unwrap();
    }
    onOpenChange(false);
  };

  const handleGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiGenerated(undefined);
    try {
      const response = await fetch("/api/generate-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      const data = await response.json();
      if (data.error) {
        toast.error("Error: " + data.error);
        return;
      }
      const text = data.choices?.[0]?.message?.content ?? "";
      console.log("debugg text", text);
      const clean = text.replace(/```json|```/g, "").trim();
      console.log("debug text after clean", clean);

      const parsed: QuestionFormValues = JSON.parse(clean);
      setAiGenerated(parsed);
    } catch (err) {
      toast.error("AI generation failed: " + err);
    } finally {
      setAiLoading(false);
    }
  };

  const formKey = aiGenerated
    ? JSON.stringify(aiGenerated)
    : question?.id || "create";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90%] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Question" : "Create Question"}
          </DialogTitle>
        </DialogHeader>
        {!isEdit && (
          <div className="flex gap-2 p-3 rounded-lg border border-dashed border-purple-300 bg-purple-50 dark:bg-purple-950/20 dark:border-purple-800">
            <Input
              placeholder='e.g. "React hooks, medium difficulty, multiple choice"'
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              disabled={aiLoading}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleGenerate}
              disabled={aiLoading || !aiPrompt.trim()}
              className="shrink-0 border-purple-400 text-purple-700 hover:bg-purple-100 dark:text-purple-300"
            >
              {aiLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-1" />
              )}
              {aiLoading ? "Generating..." : "Generate"}
            </Button>
          </div>
        )}

        <QuestionForm
          key={formKey}
          defaultValues={aiGenerated ?? question}
          onSubmit={handleSubmit}
          loading={loading}
          submitLabel={isEdit ? "Save Changes" : "Create Question"}
        />
      </DialogContent>
    </Dialog>
  );
}
