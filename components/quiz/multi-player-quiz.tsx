"use client";

import { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useGetQuizByIdQuery } from "@/lib/features/quizzes/quizzesSlice";
import { Check, Clock } from "lucide-react";
import CodeBlock from "./code-display";
import { toast } from "sonner";
import NotFoundQuiz from "../share-component/not-found-quiz";
import { useSearchParams } from "next/navigation";
import RoomQR from "./qr-room";

type CurrentQuestion = {
  id: number;
  text: string;
  answers: { id: number; text: string }[];
  questionIndex: number;
  code?: string | null;
  questionType?: string;
  points?: number;
  difficulty?: string;
  hint?: string;
};

type AnswerResult = {
  questionIndex: number;
  questionText: string;
  selectedAnswerTexts: string[];
  correctAnswerTexts: string[];
  correct: boolean;
  points: number;
};

type RoomState = {
  roomCode: string;
  owner: string;
  participants: string[];
  started: boolean;
  finished?: boolean;
  quizId: number;
  scores?: Record<string, number>;
  finishedPlayers?: string[];
  playerCurrentQuestion?: Record<string, CurrentQuestion>;
  playerQuestionIndex?: Record<string, number>;
  playerAnswerHistory?: Record<string, AnswerResult[]>;
  startedAt?: number;
};

export default function MultiplayerQuizPage({ quizId }: { quizId: string }) {
  const [stompClient, setStompClient] = useState<Client | null>(null);

  const searchParams = useSearchParams();

  const [roomCode, setRoomCode] = useState(
    searchParams.get("code")?.toUpperCase() ?? "",
  );
  const [username, setUsername] = useState(
    searchParams.get("username")?.toLowerCase() ?? "",
  );
  const [room, setRoom] = useState<RoomState | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const subscriptionRef = useRef<any>(null);

  const [hint, setHint] = useState<string | null>(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [hintUsedMap, setHintUsedMap] = useState<Record<number, number>>({});

  const [totalHintsUsed, setTotalHintsUsed] = useState(0);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const attemptStartedRef = useRef(false);
  const hintRequestingRef = useRef(false);
  const { data: quiz, isLoading, error } = useGetQuizByIdQuery(quizId);

  useEffect(() => {
    if (attemptStartedRef.current) return;
    const startNewAttempt = async () => {
      try {
        const res = await fetch(`/api/quizzes/${quizId}/start-attempt`, {
          method: "POST",
        });
        const data = await res.json();
        setAttemptId(data.attemptId);
        attemptStartedRef.current = true;
      } catch (err) {
        console.error("Failed to start attempt", err);
      }
    };
    startNewAttempt();
  }, [quizId]);

  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start/sync timer when room starts
  useEffect(() => {
    if (!room?.started || room.finished || !room.startedAt) return;
    if (timerRef.current) clearInterval(timerRef.current);

    // Sync elapsed from server startedAt so all clients are in sync
    const syncElapsed = () => {
      const diff = Math.floor((Date.now() - room.startedAt!) / 1000);
      setElapsed(diff);
    };

    syncElapsed();
    timerRef.current = setInterval(syncElapsed, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [room?.started, room?.startedAt]);

  // Stop timer when finished
  useEffect(() => {
    if (room?.finished && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [room?.finished]);
  const timeLimitSeconds = quiz ? quiz.duration * 60 : null;
  const timeRemaining =
    timeLimitSeconds !== null ? Math.max(0, timeLimitSeconds - elapsed) : null;
  const timeIsUp = timeLimitSeconds !== null && timeRemaining === 0;
  const isWarning = timeRemaining !== null && timeRemaining <= 60;
  const isDanger = timeRemaining !== null && timeRemaining <= 30;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };
  // Auto-submit when time runs out
  useEffect(() => {
    if (!timeIsUp || !stompClient?.connected || !room || iFinished) return;
    if (selectedAnswers.length > 0) handleSubmit();
  }, [timeIsUp]);

  const timeUpSentRef = useRef(false);

  useEffect(() => {
    if (!timeIsUp || !stompClient?.connected || !room || room.finished) return;
    if (timeUpSentRef.current) return;
    timeUpSentRef.current = true;

    // Submit current answer if any selected
    if (selectedAnswers.length > 0 && !hasAnswered) {
      handleSubmit();
    }

    // Tell backend time is up only owner needs to send this once
    if (isOwner) {
      stompClient.publish({
        destination: "/app/time-up",
        body: JSON.stringify({ roomCode: room.roomCode }),
      });
    }
  }, [timeIsUp]);

  // Auto-connect when we have username + roomCode from URL
  useEffect(() => {
    if (!username || !roomCode || stompClient?.connected) return;

    const normalizedUsername = username.trim().toLowerCase();
    const normalizedRoomCode = roomCode.trim().toUpperCase();

    const client = new Client({
      webSocketFactory: () => {
        const base = process.env.NEXT_PUBLIC_WEBSOCKET_URL || "";
        const url = base.endsWith("/") ? `${base}ws` : `${base}/ws`;
        return new SockJS(`${url}?username=${normalizedUsername}`);
      },
      connectHeaders: { username: normalizedUsername },
      reconnectDelay: 5000,
    });

    client.onConnect = () => {
      console.log("Connected to quiz room");

      // Subscribe before publishing
      if (subscriptionRef.current) subscriptionRef.current.unsubscribe();
      const sub = client.subscribe(
        `/topic/room/${normalizedRoomCode}`,
        (message) => {
          const roomUpdate: RoomState = JSON.parse(message.body);
          setRoom((prev) => {
            const prevQ = prev?.playerCurrentQuestion?.[normalizedUsername];
            const nextQ =
              roomUpdate.playerCurrentQuestion?.[normalizedUsername];
            if (prevQ?.questionIndex !== nextQ?.questionIndex) {
              setHasAnswered(false);
              setSelectedAnswers([]);
              setHint(null);
            }
            return roomUpdate;
          });
        },
      );
      subscriptionRef.current = sub;

      client.publish({
        destination: "/app/join-room",
        body: JSON.stringify({
          roomCode: normalizedRoomCode,
          username: normalizedUsername,
        }),
      });
    };

    client.onStompError = (frame) => {
      console.error("STOMP Error:", frame);
      toast.error("Failed to connect to room");
    };

    client.activate();
    setStompClient(client);

    return () => {
      client.deactivate();
    };
  }, [username, roomCode]); // runs once when both are populated
  if (isLoading) return <p>Loading quiz...</p>;
  if (error || !quiz) return <NotFoundQuiz />;

  const normalizedUsername = username.trim().toLowerCase();
  const totalQuestions = quiz?.questions?.length ?? 0;
  const addLog = (msg: string) =>
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);

  const subscribeToRoomTopic = (clientInstance: Client, code: string) => {
    if (subscriptionRef.current) subscriptionRef.current.unsubscribe();
    const sub = clientInstance.subscribe(`/topic/room/${code}`, (message) => {
      const roomUpdate: RoomState = JSON.parse(message.body);
      setRoom((prev) => {
        const prevQ = prev?.playerCurrentQuestion?.[normalizedUsername];
        const nextQ = roomUpdate.playerCurrentQuestion?.[normalizedUsername];
        if (prevQ?.questionIndex !== nextQ?.questionIndex) {
          setHasAnswered(false);
          setSelectedAnswers([]);
          setHint(null);
        }
        return roomUpdate;
      });
      addLog(`Room update — started: ${roomUpdate.started}`);
    });
    subscriptionRef.current = sub;
  };

  const connectAndCreate = () => {
    if (!username) return toast.warning("Enter username");
    if (stompClient?.connected) {
      stompClient.publish({
        destination: "/app/create-room",
        body: JSON.stringify({
          quizId: Number(quizId),
          username: normalizedUsername,
        }),
      });
      return;
    }
    const client = new Client({
      webSocketFactory: () =>
        new SockJS(
          `${process.env.NEXT_PUBLIC_WEBSOCKET_URL}ws?username=${normalizedUsername}`,
        ),
      connectHeaders: { username: normalizedUsername },
      reconnectDelay: 5000,
    });
    client.onConnect = () => {
      addLog("Connected");
      client.subscribe("/user/queue/reply", (message) => {
        const newRoom: RoomState = JSON.parse(message.body);
        const code = newRoom.roomCode;
        setRoomCode(code);
        setRoom(newRoom);
        subscribeToRoomTopic(client, code);
        client.publish({
          destination: "/app/join-room",
          body: JSON.stringify({
            roomCode: code,
            username: normalizedUsername,
          }),
        });
      });
      setTimeout(() => {
        client.publish({
          destination: "/app/create-room",
          body: JSON.stringify({
            quizId: Number(quizId),
            username: normalizedUsername,
          }),
        });
      }, 100);
    };
    client.onStompError = (frame) =>
      addLog("STOMP error: " + frame.headers?.message);
    client.activate();
    setStompClient(client);
  };

  const connectAndJoin = () => {
    if (!username || !roomCode)
      return toast.warning("Enter username and room code");
    if (stompClient?.connected) {
      subscribeToRoomTopic(stompClient, roomCode);
      stompClient.publish({
        destination: "/app/join-room",
        body: JSON.stringify({ roomCode, username: normalizedUsername }),
      });
      return;
    }
    const client = new Client({
      webSocketFactory: () =>
        new SockJS(
          `${process.env.NEXT_PUBLIC_WEBSOCKET_URL}ws?username=${normalizedUsername}`,
        ),
      connectHeaders: { username: normalizedUsername },
      reconnectDelay: 5000,
    });
    client.onConnect = () => {
      addLog("Connected");
      subscribeToRoomTopic(client, roomCode);
      client.publish({
        destination: "/app/join-room",
        body: JSON.stringify({ roomCode, username: normalizedUsername }),
      });
    };
    client.onStompError = (frame) =>
      addLog("STOMP error: " + frame.headers?.message);
    client.activate();
    setStompClient(client);
  };

  const handleStartRoom = () => {
    if (!stompClient?.connected || !roomCode) return;
    stompClient.publish({
      destination: "/app/start-room",
      body: JSON.stringify({ roomCode, username: normalizedUsername }),
    });
  };

  const handleGetHint = async (question: CurrentQuestion) => {
    if (!attemptId) return toast.error("Attempt not ready yet!");
    if (hintRequestingRef.current) return;
    const usedOnThisQuestion = hintUsedMap[question.id] || 0;
    if (usedOnThisQuestion >= 1)
      return toast.warning("Already used hint for this question.");
    if (totalHintsUsed >= quiz.maxHintsPerQuestion)
      return toast.warning(
        `You've used all ${quiz.maxHintsPerQuestion} hints.`,
      );
    try {
      hintRequestingRef.current = true;
      setHintLoading(true);
      const res = await fetch(
        `/api/quizzes/${quizId}/questions/${question.id}/hint?attemptId=${attemptId}`,
      );
      const msg = await res.text();
      if (!res.ok) return toast.warning(msg);
      setHint(msg);
      setHintUsedMap((prev) => ({
        ...prev,
        [question.id]: usedOnThisQuestion + 1,
      }));
      setTotalHintsUsed((prev) => prev + 1);
    } finally {
      setHintLoading(false);
      hintRequestingRef.current = false;
    }
  };

  const toggleAnswer = (answerId: number, questionType?: string) => {
    if (hasAnswered) return;
    const isMultiple = questionType === "MULTIPLE_CHOICE";
    if (isMultiple) {
      setSelectedAnswers((prev) =>
        prev.includes(answerId)
          ? prev.filter((id) => id !== answerId)
          : [...prev, answerId],
      );
    } else {
      setSelectedAnswers((prev) => (prev.includes(answerId) ? [] : [answerId]));
    }
  };

  const handleSubmit = () => {
    if (hasAnswered || !stompClient?.connected || !room) return;
    if (selectedAnswers.length === 0)
      return toast.warning("Select an answer first");
    setHasAnswered(true);
    stompClient.publish({
      destination: "/app/answer-question",
      body: JSON.stringify({
        roomCode: room.roomCode,
        username: normalizedUsername,
        answer: selectedAnswers.join(","),
      }),
    });
  };

  const isOwner = room?.owner?.trim().toLowerCase() === normalizedUsername;
  const myQuestion = room?.playerCurrentQuestion?.[normalizedUsername] ?? null;
  console.log("my question", myQuestion);
  const myIndex = room?.playerQuestionIndex?.[normalizedUsername] ?? 0;
  const iFinished =
    room?.finishedPlayers?.includes(normalizedUsername) ?? false;
  const leaderboard = room?.participants
    ?.map((p) => ({ username: p, score: room.scores?.[p] ?? 0 }))
    ?.sort((a, b) => b.score - a.score);
  const finishedCount = room?.finishedPlayers?.length ?? 0;
  const totalPlayers = room?.participants?.length ?? 0;
  const progress =
    ((myQuestion?.questionIndex ?? 1 + 1) / quiz.questions.length) * 100;

  const renderAnswers = (question: CurrentQuestion) => {
    const { answers, questionType } = question;
    const isMultiple = questionType === "MULTIPLE_CHOICE";
    const isTrueFalse = questionType === "TRUE_FALSE";

    if (isTrueFalse) {
      return (
        <div className="grid grid-cols-2 gap-4 mt-6">
          {answers.map((a) => {
            const selected = selectedAnswers.includes(a.id);
            const isTrue = a.text.toLowerCase() === "true";
            return (
              <button
                key={a.id}
                disabled={hasAnswered}
                onClick={() => toggleAnswer(a.id, questionType)}
                className={`relative flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 font-bold text-xl transition-all duration-200
          ${hasAnswered ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          ${
            selected
              ? isTrue
                ? "border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
                : "border-rose-500 bg-rose-500/15 text-rose-600 dark:text-rose-300"
              : "border-sky-100 dark:border-slate-700 bg-sky-50 dark:bg-slate-900/40 text-sky-600 dark:text-slate-400 hover:border-sky-300 dark:hover:border-slate-500 hover:text-sky-800 dark:hover:text-white"
          }`}
              >
                <span className="text-4xl">{isTrue ? "✓" : "✗"}</span>
                <span>{a.text}</span>
                {selected && (
                  <span className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center bg-current">
                    <Check className="w-3 h-3 text-white dark:text-[#0d121f]" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      );
    }

    if (isMultiple) {
      return (
        <div className="grid grid-cols-1 gap-3 mt-6">
          {answers.map((a) => {
            const selected = selectedAnswers.includes(a.id);
            return (
              <button
                key={a.id}
                disabled={hasAnswered}
                onClick={() => toggleAnswer(a.id, questionType)}
                className={`group/btn flex items-center gap-4 w-full text-left p-5 rounded-2xl border-2 transition-all duration-200
          ${hasAnswered ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          ${
            selected
              ? "border-sky-500 bg-sky-500/10 text-sky-700 dark:text-white"
              : "border-sky-100 dark:border-slate-700 bg-sky-50 dark:bg-slate-900/40 text-sky-700 dark:text-slate-300 hover:border-sky-300 dark:hover:border-slate-500 hover:text-sky-900 dark:hover:text-white"
          }`}
              >
                <div
                  className={`w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all
          ${
            selected
              ? "border-sky-500 bg-sky-500"
              : "border-sky-200 dark:border-slate-600 group-hover/btn:border-sky-400 dark:group-hover/btn:border-slate-400"
          }`}
                >
                  {selected && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="font-medium tracking-wide">{a.text}</span>
              </button>
            );
          })}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-3 mt-6">
        {answers.map((a, idx) => {
          const selected = selectedAnswers.includes(a.id);
          const labels = ["A", "B", "C", "D", "E"];
          return (
            <button
              key={a.id}
              disabled={hasAnswered}
              onClick={() => toggleAnswer(a.id, questionType)}
              className={`group/btn flex items-center gap-4 w-full text-left p-5 rounded-2xl border-2 transition-all duration-200
          ${hasAnswered ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          ${
            selected
              ? "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-white"
              : "border-amber-100 dark:border-slate-700 bg-amber-50 dark:bg-slate-900/40 text-amber-700 dark:text-slate-300 hover:border-amber-300 dark:hover:border-slate-500 hover:text-amber-900 dark:hover:text-white"
          }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-sm font-bold transition-all
          ${
            selected
              ? "bg-amber-500 text-black"
              : "bg-amber-100 dark:bg-slate-800 text-amber-600 dark:text-slate-400 group-hover/btn:bg-amber-200 dark:group-hover/btn:bg-slate-700"
          }`}
              >
                {labels[idx] ?? idx + 1}
              </div>
              <span className="font-medium tracking-wide">{a.text}</span>
              <div className="ml-auto">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
            ${
              selected
                ? "border-amber-500"
                : "border-amber-200 dark:border-slate-600 group-hover/btn:border-amber-400 dark:group-hover/btn:border-slate-400"
            }`}
                >
                  {selected && (
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto dark:bg-[#080b14] bg-white">
      {!room && (
        <div className="min-h-screen flex items-center justify-center px-4 mt-8 bg-white dark:bg-[#080b14]">
          <div className="relative w-full max-w-md">
            <div className="absolute top-0 right-0 w-14 h-14 border-t-[1.5px] border-r-[2.5px] border-sky-500/20 rounded-tr-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-10 h-10 border-b-[1.5px] border-l-[2.5px] border-violet-500/15 rounded-bl-3xl pointer-events-none" />
            <div className="bg-gray-50 dark:bg-[#0d1220] border border-gray-200 dark:border-slate-800 rounded-3xl p-9 space-y-5 font-mono text-gray-900 dark:text-white overflow-hidden">
              <div className="flex gap-2 flex-wrap justify-center">
                <div className="inline-flex items-center gap-2 bg-orange-50 dark:bg-[#0a1628] border border-orange-200 dark:border-[#1e3a5f] rounded-lg px-2.5 py-1.5 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                  <span className="text-orange-500 dark:text-orange-400 text-[11px] tracking-widest uppercase">
                    multiplayer
                  </span>
                </div>

                <div className="inline-flex items-center gap-2 bg-sky-50 dark:bg-[#0a1628] border border-sky-200 dark:border-[#1e3a5f] rounded-lg px-2.5 py-1.5 mb-1">
                  <span className="text-[9px] text-gray-400 dark:text-slate-600 uppercase tracking-widest">
                    quiz
                  </span>
                  <span className="text-gray-300 dark:text-slate-700 text-[10px]">
                    ·
                  </span>
                  <span className="text-sky-600 dark:text-sky-400 text-[11px] tracking-widest uppercase">
                    {quiz?.title}
                  </span>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100 tracking-tight">
                  CodeRoom
                </h2>
                <p className="text-gray-400 dark:text-slate-500 text-xs mt-1">
                  join or create a live quiz room
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-widest text-gray-400 dark:text-slate-500">
                  username
                </label>
                <input
                  type="text"
                  placeholder="your_handle"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-gray-100 dark:bg-[#080e1c] border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sky-600 dark:text-sky-300 text-sm placeholder-gray-300 dark:placeholder-slate-700 focus:outline-none focus:border-sky-500 transition"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200 dark:bg-slate-800" />
                <span className="text-[11px] text-gray-400 dark:text-slate-600">
                  join existing
                </span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-slate-800" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-widest text-gray-400 dark:text-slate-500">
                  room code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. XK-4821"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    className="flex-1 bg-gray-100 dark:bg-[#080e1c] border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sky-600 dark:text-sky-300 text-sm placeholder-gray-300 dark:placeholder-slate-700 focus:outline-none focus:border-sky-500 transition"
                  />
                  <button
                    onClick={connectAndJoin}
                    disabled={!roomCode.trim()}
                    className="px-5 cursor-pointer rounded-xl bg-sky-50 dark:bg-[#0f1e35] border border-sky-200 dark:border-[#1e4976] text-sky-600 dark:text-sky-400 text-sm font-semibold hover:bg-sky-100 dark:hover:bg-[#162840] transition whitespace-nowrap disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    join →
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200 dark:bg-slate-800" />
                <span className="text-[11px] text-gray-400 dark:text-slate-600">
                  or
                </span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-slate-800" />
              </div>

              <button
                onClick={connectAndCreate}
                disabled={!!roomCode.trim()}
                className="w-full py-3.5 cursor-pointer rounded-xl bg-sky-500 text-white dark:text-[#020c1b] text-sm font-bold tracking-wide hover:opacity-90 transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                + create room
              </button>

              <p className="text-center text-[11px] text-gray-400 dark:text-slate-600 italic">
                rooms expire after 30 min of inactivity
              </p>
            </div>
          </div>
        </div>
      )}

      {room && (
        <div className="space-y-4 mt-20">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono mb-1">
                room code
              </p>
              <p className="text-3xl font-mono font-bold text-sky-400 tracking-[0.18em]">
                {room.roomCode}
              </p>
              <RoomQR roomId={room.roomCode} />
            </div>

            <span
              className={`px-3 py-1 rounded-full text-[11px] font-semibold font-mono border tracking-wide ${
                room.finished
                  ? "bg-emerald-950/60 border-emerald-800 text-emerald-400"
                  : room.started
                  ? "bg-greent-950/60 border-green-800 text-green-400 dark:bg-violet-950/60 dark:border-violet-800 dark:text-violet-400"
                  : "bg-amber-950/60 border-amber-800 text-amber-400"
              }`}
            >
              {room.finished
                ? "● finished"
                : room.started
                ? "● playing"
                : "◌ waiting"}
            </span>
          </div>
          <div className="inline-flex items-center gap-2 bg-sky-50 dark:bg-[#0a1628] border border-sky-200 dark:border-[#1e3a5f] rounded-lg px-2.5 py-1.5 mb-1">
            <span className="text-[9px] text-gray-400 dark:text-slate-600 uppercase tracking-widest">
              quiz
            </span>
            <span className="text-gray-300 dark:text-slate-700 text-[10px]">
              ·
            </span>
            <span className="text-sky-600 dark:text-sky-400 text-[11px] tracking-widest uppercase">
              {quiz?.title}
            </span>
          </div>
          {/* Players panel */}
          <div className="bg-gray-50 dark:bg-[#080e1c] border border-gray-200 dark:border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 font-mono uppercase tracking-wider">
                players ({totalPlayers})
              </p>
              {room.started && (
                <span className="text-[11px] text-gray-400 dark:text-slate-500 font-mono">
                  {finishedCount}/{totalPlayers} completed
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {room.participants?.map((p) => {
                const pFinished = room.finishedPlayers?.includes(p);
                const pIndex = room.playerQuestionIndex?.[p] ?? 0;
                return (
                  <span
                    key={p}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono border transition-all ${
                      pFinished
                        ? "bg-green-100 dark:bg-emerald-950/50 dark:border-emerald-800 text-emerald-400"
                        : "bg-gray-100 dark:bg-slate-900 border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300"
                    }`}
                  >
                    {p}
                    {p === room.owner && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-500 font-extrabold opacity-60">
                        (host)
                      </span>
                    )}
                    {room.started && !pFinished && (
                      <span className="text-[10px] text-gray-400 dark:text-slate-600">
                        q{pIndex + 1}
                      </span>
                    )}
                    {pFinished && (
                      <Check className="w-3 h-3 text-emerald-400" />
                    )}
                    {room.scores?.[p] !== undefined && room.started && (
                      <span className="text-sky-500 dark:text-sky-400 font-bold ml-0.5">
                        {room.scores[p]}pts
                      </span>
                    )}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Start button — owner only */}
          {!room.started && isOwner && (
            <button
              onClick={handleStartRoom}
              className="relative cursor-pointer w-full py-3.5 rounded-xl font-mono font-bold text-sm tracking-widest uppercase overflow-hidden group
                bg-[#0f1e35] border border-sky-500/30 text-sky-400
                hover:border-sky-400/60 hover:text-sky-300
                active:scale-[0.98] transition-all duration-200"
            >
              <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 bg-gradient-to-r from-transparent via-sky-500/10 to-transparent" />
              <span className="relative flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                start quiz
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              </span>
            </button>
          )}

          {/* Waiting message — non-owner */}
          {!room.started && !isOwner && (
            <>
              <p className="text-center text-sm text-slate-500 font-mono italic py-2">
                ◌ waiting for host to start...
              </p>
            </>
          )}

          {/* Waiting for others after finishing */}
          {room.started && !room.finished && iFinished && (
            <div className="bg-gray-50 dark:bg-[#080e1c] border border-gray-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 font-mono">
              <div className="text-center space-y-1">
                <p className="text-emerald-500 dark:text-emerald-400 font-bold text-lg">
                  all questions done!
                </p>
                <p className="text-gray-400 dark:text-slate-500 text-xs">
                  {finishedCount}/{totalPlayers} players finished — waiting for
                  others...
                </p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 dark:text-slate-600 uppercase tracking-widest mb-3">
                  current standings
                </p>
                <div className="space-y-2">
                  {leaderboard?.map((p, i) => (
                    <div
                      key={p.username}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl border text-sm
              ${
                p.username === normalizedUsername
                  ? "dark:bg-sky-950/40 bg-green-100 dark:border-sky-800 text-sky-300"
                  : "bg-white dark:bg-slate-900/40 border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-400"
              }`}
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className={`text-xs w-5 ${
                            i === 0
                              ? "text-amber-500 dark:text-amber-400"
                              : "text-gray-300 dark:text-slate-600"
                          }`}
                        >
                          #{i + 1}
                        </span>
                        {p.username}
                        {room.finishedPlayers?.includes(p.username) ? (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-500">
                            done
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-400 dark:text-slate-600">
                            playing...
                          </span>
                        )}
                      </span>
                      <span className="font-bold">{p.score} pts</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {room.started &&
            !room.finished &&
            !iFinished &&
            myQuestion &&
            (() => {
              const usedOnThisQuestion = hintUsedMap[myQuestion.id] || 0;
              const hintDisabled =
                hintLoading ||
                usedOnThisQuestion >= 1 ||
                totalHintsUsed >= quiz.maxHintsPerQuestion;
              return (
                <div className="relative group">
                  {timeRemaining !== null && (
                    <div
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border font-mono text-sm font-bold transition-all duration-300 mb-4
      ${
        isDanger
          ? "border-rose-500/50 bg-rose-500/10 text-rose-600 dark:text-rose-400 animate-pulse"
          : isWarning
          ? "border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400"
          : "border-gray-300 dark:border-slate-700 bg-gray-100 dark:bg-slate-900/40 text-gray-700 dark:text-slate-300"
      }`}
                    >
                      <Clock className="w-4 h-4" />
                      {formatTime(timeRemaining)}
                    </div>
                  )}
                  {timeIsUp && (
                    <div className="mb-4 p-3 rounded-xl border border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-300 text-center font-mono text-sm font-bold tracking-wide">
                      time's up — submitting...
                    </div>
                  )}
                  {!room.started && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-800 flex items-center gap-2 text-xs font-mono text-gray-400 dark:text-slate-500">
                      <Clock className="w-3 h-3" />
                      {quiz?.duration} min time limit
                    </div>
                  )}
                  <div className="absolute -inset-1 bg-gradient-to-r from-sky-500/20 to-transparent rounded-[2.5rem] blur opacity-30 group-hover:opacity-50 transition-opacity" />
                  <div className="relative bg-white dark:bg-[#0d121f] border border-gray-200 dark:border-slate-800 p-8 md:p-12 rounded-[2rem] shadow-2xl">
                    <div className="absolute top-0 right-0 p-6 pointer-events-none">
                      <div className="w-14 h-14 border-t-2 border-r-2 border-sky-500/20 rounded-tr-3xl" />
                    </div>
                    <div className="flex flex-wrap justify-between items-center mb-6 gap-3 text-sm">
                      <span className="text-gray-500 dark:text-slate-400 font-mono">
                        question {myIndex + 1}
                        {totalQuestions ? ` / ${totalQuestions}` : ""}
                      </span>
                      <div className="flex gap-2 items-center flex-wrap">
                        {myQuestion.questionType && (
                          <span className="text-xs px-3 py-1 rounded-full border border-gray-300 dark:border-slate-700 text-gray-500 dark:text-slate-400">
                            {myQuestion.questionType === "MULTIPLE_CHOICE"
                              ? "Multi Select"
                              : myQuestion.questionType === "TRUE_FALSE"
                              ? "True / False"
                              : "Single Choice"}
                          </span>
                        )}
                        {myQuestion.points && (
                          <span className="text-xs px-3 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                            +{myQuestion.points} pts
                          </span>
                        )}
                        {myQuestion.difficulty && (
                          <span className="text-xs px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20">
                            {myQuestion.difficulty}
                          </span>
                        )}
                      </div>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 leading-relaxed tracking-tight">
                      {myQuestion.text}
                    </h3>
                    {myQuestion.code && (
                      <div className="mb-6">
                        <CodeBlock code={myQuestion.code} />
                      </div>
                    )}
                    {renderAnswers(myQuestion)}
                    {!hasAnswered && (
                      <div className="mt-6 space-y-3">
                        {hint && (
                          <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-sm">
                            {hint}
                          </div>
                        )}
                        <div className="w-full my-5 space-y-2">
                          <div className="flex justify-between font-mono text-[10px] text-gray-600 dark:text-slate-200 uppercase tracking-widest">
                            <span>Sync Progress</span>
                            <span>{Math.round(progress)}%</span>
                          </div>
                          <div className="h-5 bg-gray-200 dark:bg-slate-900 rounded-md border border-gray-300 dark:border-slate-800 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-sky-600 to-sky-400 transition-all duration-700"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                        {myQuestion?.hint?.trim() != "" && (
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleGetHint(myQuestion)}
                              disabled={hintDisabled}
                              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-30 disabled:cursor-not-allowed text-black font-bold text-sm transition-all"
                            >
                              {hintLoading ? "Loading..." : "Show Hint"}
                            </button>
                            <span className="text-xs text-gray-400 dark:text-slate-500 font-mono">
                              {totalHintsUsed}/{quiz.maxHintsPerQuestion} hints
                              used
                              {usedOnThisQuestion >= 1 && (
                                <span className="ml-2 text-amber-500/70">
                                  · used on this question
                                </span>
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    {!hasAnswered && (
                      <button
                        onClick={handleSubmit}
                        disabled={selectedAnswers.length === 0 || timeIsUp}
                        className={`mt-4 w-full p-4 rounded-2xl font-bold text-sm tracking-wide transition-all duration-200
        ${
          selectedAnswers.length === 0
            ? "bg-gray-200 dark:bg-slate-800 text-gray-400 dark:text-slate-500 cursor-not-allowed border border-gray-300 dark:border-slate-700"
            : myQuestion.questionType === "TRUE_FALSE"
            ? "bg-emerald-500 text-black hover:opacity-90"
            : myQuestion.questionType === "MULTIPLE_CHOICE"
            ? "bg-sky-500 text-black hover:opacity-90"
            : "bg-amber-500 text-black hover:opacity-90"
        }`}
                      >
                        {selectedAnswers.length === 0
                          ? "select an answer"
                          : `submit answer${
                              selectedAnswers.length > 1
                                ? `s (${selectedAnswers.length})`
                                : ""
                            }`}
                      </button>
                    )}
                    {hasAnswered && (
                      <p className="text-center text-sm text-gray-400 dark:text-slate-500 font-mono mt-6 italic">
                        loading next question...
                      </p>
                    )}
                  </div>
                </div>
              );
            })()}

          {room.started && !room.finished && !iFinished && !myQuestion && (
            <p className="text-center text-sm text-slate-500 font-mono italic py-6">
              loading question...
            </p>
          )}

          {room.finished &&
            (() => {
              const myHistory =
                room.playerAnswerHistory?.[normalizedUsername] ?? [];
              const myScore = room.scores?.[normalizedUsername] ?? 0;
              const correctCount = myHistory.filter((r) => r.correct).length;

              return (
                <div className="space-y-5 pb-10">
                  <div className="bg-white dark:bg-[#0d1220] border border-sky-100 dark:border-slate-800 rounded-2xl p-6 font-mono">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <p className="text-[10px] text-sky-500 dark:text-slate-500 uppercase tracking-widest mb-1">
                          your score
                        </p>
                        <p className="text-4xl font-bold text-sky-500 dark:text-sky-400">
                          {myScore} pts
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-sky-500 dark:text-slate-500 uppercase tracking-widest mb-1">
                          accuracy
                        </p>
                        <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                          {correctCount}/{myHistory.length}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-sky-100 dark:border-slate-800 pt-4">
                      <p className="text-[10px] text-sky-400 dark:text-slate-600 uppercase tracking-widest mb-3">
                        final leaderboard
                      </p>
                      <div className="space-y-2">
                        {leaderboard?.map((p, i) => (
                          <div
                            key={p.username}
                            className={`flex items-center justify-between px-3 py-2 rounded-xl border text-sm
            ${
              p.username === normalizedUsername
                ? "bg-green-100 text-black border-0 dark:bg-sky-950/40 dark:border-sky-800 dark:text-sky-300"
                : "bg-green-50 dark:bg-slate-900/40 border-sky-100 dark:border-slate-800 text-sky-700 dark:text-slate-400"
            }`}
                          >
                            <span className="flex items-center gap-3">
                              <span
                                className={`text-xs w-5 font-bold ${
                                  i === 0
                                    ? "text-amber-500 dark:text-amber-400"
                                    : "text-sky-300 dark:text-slate-600"
                                }`}
                              >
                                #{i + 1}
                              </span>
                              {p.username}
                              {p.username === normalizedUsername && (
                                <span className="text-[10px] text-sky-500">
                                  (you)
                                </span>
                              )}
                            </span>
                            <span className="font-bold">{p.score} pts</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-sky-50 dark:bg-[#080e1c] border border-sky-100 dark:border-slate-800 rounded-2xl p-4 font-mono">
                    <p className="text-[10px] text-sky-500 dark:text-slate-500 uppercase tracking-widest mb-4">
                      your answers
                    </p>
                    <div className="space-y-3">
                      {myHistory.map((r, i) => (
                        <div
                          key={i}
                          className={`rounded-xl border p-4 space-y-3
          ${
            r.correct
              ? "bg-green-100 border-green-200 dark:bg-emerald-950/30 dark:border-emerald-800"
              : "bg-rose-100 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900"
          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-sm text-slate-800 dark:text-slate-200 leading-snug">
                              {r.questionText}
                            </p>
                            <span
                              className={`shrink-0 text-[11px] px-2.5 py-0.5 rounded-full border font-bold
              ${
                r.correct
                  ? "bg-emerald-950/60 border-emerald-700 text-emerald-400"
                  : "bg-rose-200 border-rose-300 text-rose-400 dark:bg-rose-950/60 dark:border-rose-800 dark:text-rose-400"
              }`}
                            >
                              {r.correct ? `+${r.points}pts` : "wrong"}
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            <p className="text-[10px] text-sky-500 dark:text-slate-600 uppercase tracking-wider">
                              your answer
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {r.selectedAnswerTexts.map((a, j) => (
                                <span
                                  key={j}
                                  className={`text-xs px-2.5 py-1 rounded-lg border
                  ${
                    r.correct
                      ? "bg-emerald-100 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300"
                      : "bg-rose-100 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300"
                  }`}
                                >
                                  {a}
                                </span>
                              ))}
                            </div>
                          </div>

                          {!r.correct && (
                            <div className="space-y-1.5">
                              <p className="text-[10px] text-sky-500 dark:text-slate-600 uppercase tracking-wider">
                                correct answer
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {r.correctAnswerTexts.map((a, j) => (
                                  <span
                                    key={j}
                                    className="text-xs px-2.5 py-1 rounded-lg border bg-emerald-100 border-emerald-300 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300"
                                  >
                                    {a}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
        </div>
      )}
    </div>
  );
}
