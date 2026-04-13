"use client";

import { useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useGetQuizByIdQuery } from "@/lib/features/quizzes/quizzesSlice";
import { Check } from "lucide-react";

type CurrentQuestion = {
  id: number;
  text: string;
  answers: { id: number; text: string }[];
  questionIndex: number;
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
        // New question arrived for me  - > reset hasAnswered
        if (prevQ?.questionIndex !== nextQ?.questionIndex) {
          setHasAnswered(false);
        }
        return roomUpdate;
      });

      addLog(`Room update — started: ${roomUpdate.started}`);
    });

    subscriptionRef.current = sub;
  };

  const connectAndCreate = () => {
    if (!username) return alert("Enter username");
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
    if (!username || !roomCode) return alert("Enter username and room code");
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

  const handleAnswer = (answerId: number, answerText: string) => {
    if (hasAnswered || !stompClient?.connected || !room) return;
    setHasAnswered(true);
    stompClient.publish({
      destination: "/app/answer-question",
      body: JSON.stringify({
        roomCode: room.roomCode,
        username: normalizedUsername,
        answer: String(answerId),
      }),
    });
    addLog(`Answered: ${answerText}`);
  };
  const isOwner = room?.owner?.trim().toLowerCase() === normalizedUsername;
  const myQuestion = room?.playerCurrentQuestion?.[normalizedUsername] ?? null;
  const myIndex = room?.playerQuestionIndex?.[normalizedUsername] ?? 0;
  const iFinished =
    room?.finishedPlayers?.includes(normalizedUsername) ?? false;
  const progress = totalQuestions > 0 ? (myIndex / totalQuestions) * 100 : 0;

  const leaderboard = room?.participants
    ?.map((p) => ({ username: p, score: room.scores?.[p] ?? 0 }))
    ?.sort((a, b) => b.score - a.score);

  const finishedCount = room?.finishedPlayers?.length ?? 0;
  const totalPlayers = room?.participants?.length ?? 0;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Multiplayer Quiz</h1>
      {!room && (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 p-6">
          <div className="w-full max-w-md bg-gray-850 rounded-xl shadow-xl p-8 space-y-6 font-mono text-gray-100">
            <h2 className="text-2xl font-bold text-green-400 text-center mb-4">
              🖥️ CodeRoom
            </h2>

            {/* Username */}
            <div className="flex flex-col">
              <label className="text-gray-400 mb-1">Username</label>
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-gray-800 border border-gray-700 p-5 rounded text-green-400 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Join Room */}
            <div className="flex flex-col">
              <label className="text-gray-400 mb-1">Room Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Room code to join"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="flex-grow bg-gray-800 border border-gray-700 p-5 rounded text-green-400 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={connectAndJoin}
                  className="bg-green-600 hover:bg-green-700 px-4 rounded font-semibold transition-colors"
                >
                  Join
                </button>
              </div>
            </div>

            {/* Create Room */}
            <button
              onClick={connectAndCreate}
              className="bg-blue-600 hover:bg-blue-700 w-full p-3 rounded font-semibold transition-colors"
            >
              Create Room
            </button>

            {/* Footer */}
            <p className="text-gray-500 text-sm text-center italic">
              Enter your username and join an existing room or create a new one.
            </p>
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

          {/* I finished — show leaderboard preview, others still playing */}
          {room.started && !room.finished && iFinished && (
            <div className="border rounded-xl p-5 bg-green-50 space-y-4">
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
            <div className="border rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>
                  Question {myIndex + 1}
                  {totalQuestions > 0 ? ` / ${totalQuestions}` : ""}
                </span>
              </div>
              <div className="h-2 bg rounded-full overflow-hidden">
                <div
                  className="h-2 bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <h2 className="text-xl font-semibold">{myQuestion.text}</h2>
              <div className="grid gap-2">
                {myQuestion.answers.map((a) => (
                  <button
                    key={a.id}
                    disabled={hasAnswered}
                    onClick={() => handleAnswer(a.id, a.text)}
                    className={`p-2 border rounded-lg text-left transition ${
                      hasAnswered
                        ? "opacity-50 cursor-not-allowed "
                        : "hover:bg-gray-700"
                    }`}
                  >
                    {a.text}
                  </button>
                ))}
              </div>
              {hasAnswered && (
                <p className="text-center text-sm text-gray-400 italic">
                  Loading next question...
                </p>
              )}
            </div>
          )}
          {room.started && !room.finished && !iFinished && !myQuestion && (
            <p className="text-center text-sm text-gray-400 italic py-6">
              Loading question...
            </p>
          )}
          {room.finished && (
            <div className="border rounded-xl p-4 bg-yellow-50 space-y-3">
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
      <div className="text-xs text-gray-400 max-h-28 overflow-y-auto space-y-0.5">
        {logs.map((l, i) => (
          <p key={i}>{l}</p>
        ))}
      </div>
    </div>
  );
}
