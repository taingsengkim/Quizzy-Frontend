"use client";

import { useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useGetQuizByIdQuery } from "@/lib/features/quizzes/quizzesSlice";
import { Check, CheckCheck, Copy, Terminal } from "lucide-react";
import RacingLeaderboard from "../user-page/racing-leaderboard";
import CodeBlock from "./code-display";
import { toast } from "sonner";

type CurrentQuestion = {
  id: number;
  text: string;
  answers: { id: number; text: string }[];
  questionIndex: number;
  code?: string | null;
  questionType?: string;
  points?: number;
  difficulty?: string;
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
};

export default function MultiplayerQuizPage({ quizId }: { quizId: string }) {
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [roomCode, setRoomCode] = useState("");
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState<RoomState | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const subscriptionRef = useRef<any>(null);

  const { data: quiz } = useGetQuizByIdQuery(room?.quizId?.toString() ?? "", {
    skip: !room?.quizId,
  });

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
        new SockJS(`http://localhost:8090/ws?username=${normalizedUsername}`),
      connectHeaders: { username: normalizedUsername },
      reconnectDelay: 5000,
      debug: (str) => console.log(str),
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
        new SockJS(`http://localhost:8090/ws?username=${normalizedUsername}`),
      connectHeaders: { username: normalizedUsername },
      reconnectDelay: 5000,
      debug: (str) => console.log(str),
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

    const answerPayload = selectedAnswers.join(",");

    stompClient.publish({
      destination: "/app/answer-question",
      body: JSON.stringify({
        roomCode: room.roomCode,
        username: normalizedUsername,
        answer: answerPayload,
      }),
    });
    addLog(`Answered: ${selectedAnswers.join(", ")}`);
  };

  const isOwner = room?.owner?.trim().toLowerCase() === normalizedUsername;
  const myQuestion = room?.playerCurrentQuestion?.[normalizedUsername] ?? null;
  const myIndex = room?.playerQuestionIndex?.[normalizedUsername] ?? 0;
  const iFinished =
    room?.finishedPlayers?.includes(normalizedUsername) ?? false;
  const leaderboard = room?.participants
    ?.map((p) => ({ username: p, score: room.scores?.[p] ?? 0 }))
    ?.sort((a, b) => b.score - a.score);

  const finishedCount = room?.finishedPlayers?.length ?? 0;
  const totalPlayers = room?.participants?.length ?? 0;
  const renderAnswers = (question: CurrentQuestion) => {
    const { answers, questionType } = question;
    const isMultiple = questionType === "MULTIPLE_CHOICE";
    const isTrueFalse = questionType === "TRUE_FALSE";

    if (isTrueFalse) {
      // Large toggle-style True / False buttons
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
                  ${
                    hasAnswered
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }
                  ${
                    selected
                      ? isTrue
                        ? "border-emerald-500 bg-emerald-500/15 text-emerald-300"
                        : "border-rose-500 bg-rose-500/15 text-rose-300"
                      : "border-slate-700 bg-slate-900/40 text-slate-400 hover:border-slate-500 hover:text-white"
                  }`}
              >
                <span className="text-4xl">{isTrue ? "✓" : "✗"}</span>
                <span>{a.text}</span>
                {selected && (
                  <span className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center bg-current">
                    <Check className="w-3 h-3 text-[#0d121f]" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      );
    }

    if (isMultiple) {
      // Checkbox-style — multiple can be selected
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
                  ${
                    hasAnswered
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }
                  ${
                    selected
                      ? "border-sky-500 bg-sky-500/10 text-white"
                      : "border-slate-700 bg-slate-900/40 text-slate-300 hover:border-slate-500 hover:text-white"
                  }`}
              >
                <div
                  className={`w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all
                    ${
                      selected
                        ? "border-sky-500 bg-sky-500"
                        : "border-slate-600 group-hover/btn:border-slate-400"
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
                ${
                  hasAnswered
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }
                ${
                  selected
                    ? "border-amber-500 bg-amber-500/10 text-white"
                    : "border-slate-700 bg-slate-900/40 text-slate-300 hover:border-slate-500 hover:text-white"
                }`}
            >
              {/* Letter badge */}
              <div
                className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-sm font-bold transition-all
                  ${
                    selected
                      ? "bg-amber-500 text-black"
                      : "bg-slate-800 text-slate-400 group-hover/btn:bg-slate-700"
                  }`}
              >
                {labels[idx] ?? idx + 1}
              </div>
              <span className="font-medium tracking-wide">{a.text}</span>
              {/* Radio dot */}
              <div className="ml-auto">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                    ${
                      selected
                        ? "border-amber-500"
                        : "border-slate-600 group-hover/btn:border-slate-400"
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

  console.log("my question", myQuestion);
  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Multiplayer Quiz</h1>
      {!room && (
        <div className="min-h-screen flex  justify-center ">
          <div className="relative group w-full max-w-md">
            <div className="relative bg-[#0d121f] border border-slate-800 p-8 md:p-10 rounded-[2rem] shadow-2xl space-y-6 font-mono text-white">
              <div className="absolute top-0 right-0 p-6 pointer-events-none">
                <div className="w-14 h-14 border-t-2 border-r-2 border-sky-500/20 rounded-tr-3xl" />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-white tracking-tight">
                  🖥️ CodeRoom
                </h2>
                <p className="text-slate-400 text-sm">
                  Join or create a multiplayer quiz room
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-slate-400 text-sm">Username</label>
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-900/40 border border-slate-800 p-4 rounded-xl text-sky-300 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
                />
              </div>
              <div className="space-y-2">
                <label className="text-slate-400 text-sm">Room Code</label>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter room code"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    className="flex-1 bg-slate-900/40 border border-slate-800 p-4 rounded-xl text-sky-300 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
                  />

                  <button
                    onClick={connectAndJoin}
                    className="px-5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 font-semibold hover:bg-sky-500/20 transition"
                  >
                    Join
                  </button>
                </div>
              </div>
              <button
                onClick={connectAndCreate}
                className="w-full p-4 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 text-black font-bold hover:opacity-90 transition shadow-lg"
              >
                Create Room
              </button>
              <p className="text-center text-xs text-slate-500 italic">
                Enter your username and join or create a room
              </p>
            </div>
          </div>
        </div>
      )}
      {room && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Room Code
              </p>
              <p className="text-3xl font-mono font-bold text-blue-600 tracking-widest">
                {room.roomCode}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                room.finished
                  ? "bg-green-100 text-green-700"
                  : room.started
                  ? "bg-purple-100 text-purple-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {room.finished
                ? "Finished"
                : room.started
                ? "Playing"
                : "Waiting"}
            </span>
          </div>

          {/* Players */}
          <div className="border rounded-xl p-4 ">
            <p className="text-sm font-semibold text-gray-100 mb-2">
              Players ({totalPlayers})
              {room.started && (
                <span className="ml-2 text-xs text-gray-100 font-normal">
                  {finishedCount}/{totalPlayers} completed
                </span>
              )}
            </p>
            <div className="flex flex-wrap gap-2">
              {room.participants?.map((p) => {
                const pFinished = room.finishedPlayers?.includes(p);
                const pIndex = room.playerQuestionIndex?.[p] ?? 0;
                return (
                  <span
                    key={p}
                    className={`px-3 py-1 rounded-full text-sm border flex items-center gap-1 ${
                      pFinished
                        ? " border-green-300 text-green-800"
                        : " border-gray-300 text-gray-100"
                    }`}
                  >
                    {p}
                    {p === room.owner && (
                      <span className="text-xs opacity-60">(host)</span>
                    )}
                    {room.started && !pFinished && (
                      <span className="text-xs opacity-60">q{pIndex + 1}</span>
                    )}
                    {pFinished && <Check className="w-3 h-3" />}
                    {room.scores?.[p] !== undefined && room.started && (
                      <span className="font-semibold ml-1">
                        {room.scores[p]}pts
                      </span>
                    )}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Lobby */}
          {!room.started && isOwner && (
            <button
              onClick={handleStartRoom}
              className="bg-purple-600 text-white p-3 rounded-lg w-full font-semibold hover:bg-purple-700"
            >
              Start Quiz
            </button>
          )}
          {!room.started && !isOwner && (
            <p className="text-center text-sm text-gray-400 italic">
              Waiting for host to start...
            </p>
          )}

          {room.started && !room.finished && iFinished && (
            <div className="border rounded-xl p-5  space-y-4">
              <div className="text-center">
                <p className="text-lg font-semibold text-green-800">
                  You finished all questions!
                </p>
                <p className="text-sm text-green-600 mt-1">
                  {finishedCount}/{totalPlayers} players done — waiting for
                  others...
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">
                  Current standings
                </p>
                <ul className="space-y-1">
                  {leaderboard?.map((p, i) => (
                    <li
                      key={p.username}
                      className="flex justify-between items-center py-1.5 border-b last:border-0"
                    >
                      <span className="flex items-center gap-2 text-sm">
                        <span className="text-gray-400 w-5">#{i + 1}</span>
                        <span
                          className={
                            p.username === normalizedUsername
                              ? "font-semibold"
                              : ""
                          }
                        >
                          {p.username}
                        </span>
                        {room.finishedPlayers?.includes(p.username) ? (
                          <span className="text-xs text-green-600">done</span>
                        ) : (
                          <span className="text-xs text-gray-400">
                            playing...
                          </span>
                        )}
                      </span>
                      <span className="text-sm font-semibold">
                        {p.score} pts
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {room.started && !room.finished && !iFinished && myQuestion && (
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-sky-500/20 to-transparent rounded-[2.5rem] blur opacity-30 group-hover:opacity-50 transition-opacity" />
              <div className="relative bg-[#0d121f] border border-slate-800 p-8 md:p-12 rounded-[2rem] shadow-2xl">
                <div className="absolute top-0 right-0 p-6 pointer-events-none">
                  <div className="w-14 h-14 border-t-2 border-r-2 border-sky-500/20 rounded-tr-3xl" />
                </div>
                <div className="flex flex-wrap justify-between items-center mb-6 gap-3 text-sm">
                  <span className="text-slate-400">
                    Question {myIndex + 1}
                    {totalQuestions ? ` / ${totalQuestions}` : ""}
                  </span>

                  <div className="flex gap-2 items-center flex-wrap">
                    {myQuestion.questionType && (
                      <span className="text-xs px-3 py-1 rounded-full border border-slate-700 text-slate-400">
                        {myQuestion.questionType === "MULTIPLE_CHOICE"
                          ? "Multi Select"
                          : myQuestion.questionType === "TRUE_FALSE"
                          ? "True / False"
                          : "Single Choice"}
                      </span>
                    )}

                    {myQuestion.points && (
                      <span className="text-xs px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        +{myQuestion.points} pts
                      </span>
                    )}

                    {myQuestion.difficulty && (
                      <span className="text-xs px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                        {myQuestion.difficulty}
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-2xl md:text-3xl font-bold text-white mb-6 leading-relaxed tracking-tight">
                  {myQuestion.text}
                </h3>
                {myQuestion.code && (
                  <div className="mb-6">
                    <CodeBlock code={myQuestion.code} />
                  </div>
                )}

                {/* Type-aware answer rendering */}
                {renderAnswers(myQuestion)}

                {/* Submit button */}
                {!hasAnswered && (
                  <button
                    onClick={handleSubmit}
                    disabled={selectedAnswers.length === 0}
                    className={`mt-6 w-full p-4 rounded-2xl font-bold text-sm tracking-wide transition-all duration-200
                      ${
                        selectedAnswers.length === 0
                          ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                          : myQuestion.questionType === "TRUE_FALSE"
                          ? "bg-gradient-to-r from-emerald-500 to-teal-400 text-black hover:opacity-90 shadow-lg"
                          : myQuestion.questionType === "MULTIPLE_CHOICE"
                          ? "bg-gradient-to-r from-sky-500 to-cyan-400 text-black hover:opacity-90 shadow-lg"
                          : "bg-gradient-to-r from-amber-500 to-orange-400 text-black hover:opacity-90 shadow-lg"
                      }`}
                  >
                    {selectedAnswers.length === 0
                      ? "Select an answer"
                      : `Submit Answer${
                          selectedAnswers.length > 1
                            ? `s (${selectedAnswers.length})`
                            : ""
                        }`}
                  </button>
                )}

                {hasAnswered && (
                  <p className="text-center text-sm text-slate-400 mt-6 italic">
                    Loading next question...
                  </p>
                )}
              </div>
            </div>
          )}
          {room.started && !room.finished && !iFinished && !myQuestion && (
            <p className="text-center text-sm text-gray-400 italic py-6">
              Loading question...
            </p>
          )}
          {room.finished && (
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 space-y-5 shadow-xl">
              {" "}
              <h2 className="text-xl font-bold">🏆 Final Leaderboard</h2>
              <ul className="space-y-1">
                {leaderboard?.map((p, i) => (
                  <li
                    key={p.username}
                    className={`flex justify-between items-center py-2 border-b last:border-0 ${
                      p.username === normalizedUsername ? "font-semibold" : ""
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-gray-400 text-sm w-6">
                        #{i + 1}
                      </span>
                      {p.username}
                      {p.username === normalizedUsername && (
                        <span className="text-xs text-blue-500">(you)</span>
                      )}
                    </span>
                    <span className="font-semibold">{p.score} pts</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
