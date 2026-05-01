"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { toast } from "sonner";

export default function JoinRoomComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [roomCode, setRoomCode] = useState(searchParams.get("code") ?? "");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const handleJoin = () => {
    if (!username.trim()) return toast.warning("Please enter a username");
    if (!roomCode.trim()) return toast.warning("Please enter a room code");

    // Prevent double-click spawning multiple clients
    if (clientRef.current?.active) return;

    setLoading(true);
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedRoomCode = roomCode.trim().toUpperCase();

    const client = new Client({
      webSocketFactory: () => {
        const baseUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || "";
        const url = baseUrl.endsWith("/") ? `${baseUrl}ws` : `${baseUrl}/ws`;
        return new SockJS(`${url}?username=${normalizedUsername}`);
      },
      connectHeaders: { username: normalizedUsername },
      reconnectDelay: 0,
      debug: (str) => console.log("[STOMP]", str),
    });

    clientRef.current = client;

    const cleanup = (errorMsg?: string) => {
      client.deactivate();
      clientRef.current = null;
      if (errorMsg) toast.error(errorMsg);
      setLoading(false);
    };

    client.onConnect = () => {
      console.log("Connected, subscribing to room...");

      client.subscribe(`/topic/room/${normalizedRoomCode}`, (message) => {
        try {
          const roomState = JSON.parse(message.body);
          client.deactivate();
          clientRef.current = null;
          router.push(
            `/quizzes/multiplayer/${roomState.quizId}?code=${normalizedRoomCode}&username=${normalizedUsername}`,
          );
        } catch (err) {
          console.error(err);
          cleanup("Failed to parse room data");
        }
      });

      client.subscribe(`/user/queue/errors`, (message) => {
        try {
          const error = JSON.parse(message.body);
          cleanup(error.message || "Room not found. Please check your code.");
        } catch {
          cleanup("Room not found. Please check your code.");
        }
      });

      client.publish({
        destination: "/app/join-room",
        body: JSON.stringify({
          roomCode: normalizedRoomCode,
          username: normalizedUsername,
        }),
      });

      // Safety timeout using ref-based check
      setTimeout(() => {
        if (clientRef.current?.active) {
          cleanup("Timeout: Could not join room");
        }
      }, 7000);
    };

    client.onStompError = (frame) => {
      console.error("STOMP Error:", frame);
      cleanup("Connection failed. Please try again.");
    };

    client.onWebSocketError = () => {
      cleanup("WebSocket connection failed");
    };

    client.activate();
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center 
                  bg-gray-100 dark:bg-[#080b14] px-4 relative overflow-hidden"
    >
      <div className="hidden dark:block absolute inset-0">
        <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-sky-500/10 blur-3xl rounded-full" />
        <div className="absolute bottom-[-120px] right-[-80px] w-[400px] h-[250px] bg-violet-500/10 blur-3xl rounded-full" />
      </div>
      <h1
        className="absolute text-[120px] font-black 
                   text-gray-200 dark:text-white/5 
                   pointer-events-none select-none"
      >
        JOIN
      </h1>

      <div className="relative w-full max-w-sm z-10">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-slate-300">
            Multiplayer Quiz
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-500">
            Compete with others in real-time
          </p>
        </div>
        <div
          className="absolute top-0 right-0 w-14 h-14 
                      border-t-[1.5px] border-r-[1.5px] 
                      border-sky-400/30 dark:border-sky-500/20 
                      rounded-tr-3xl pointer-events-none"
        />

        <div
          className="absolute bottom-0 left-0 w-10 h-10 
                      border-b-[1.5px] border-l-[1.5px] 
                      border-violet-400/30 dark:border-violet-500/15 
                      rounded-bl-3xl pointer-events-none"
        />

        <div
          className="bg-white dark:bg-[#0d1220] 
                      border border-gray-200 dark:border-slate-800 
                      rounded-3xl p-7 space-y-5 font-mono 
                      text-gray-900 dark:text-white
                      shadow-xl dark:shadow-[0_0_30px_rgba(56,189,248,0.08)]
                      backdrop-blur-md
                      transition-all duration-300"
        >
          <div
            className="inline-flex items-center gap-2 
                        bg-gray-100 dark:bg-[#0f1a2e] 
                        border border-gray-200 dark:border-[#1e3a5f] 
                        rounded-full px-3 py-1"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 dark:bg-sky-400 animate-pulse" />
            <span className="text-sky-600 dark:text-sky-400 text-[11px] tracking-widest uppercase">
              multiplayer
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
              Join Room
            </h2>
            <p className="text-gray-500 dark:text-slate-500 text-xs mt-1">
              enter your code to jump in
            </p>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-widest text-gray-500 dark:text-slate-500">
              username
            </label>
            <input
              type="text"
              placeholder="your_handle"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-50 dark:bg-[#080e1c] 
                       border border-gray-200 dark:border-slate-800 
                       rounded-xl px-4 py-3 
                       text-gray-900 dark:text-sky-300 
                       text-sm placeholder-gray-400 dark:placeholder-slate-700
                       focus:outline-none focus:border-sky-500 transition"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-widest text-gray-500 dark:text-slate-500">
              room code
            </label>
            <input
              type="text"
              placeholder="e.g. XK-4821"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="w-full bg-gray-50 dark:bg-[#080e1c] 
                       border border-gray-200 dark:border-slate-800 
                       rounded-xl px-4 py-3 
                       text-gray-900 dark:text-sky-300 
                       text-sm placeholder-gray-400 dark:placeholder-slate-700
                       focus:outline-none focus:border-sky-500 transition"
            />
          </div>
          <button
            onClick={handleJoin}
            disabled={loading}
            className="relative w-full py-3.5 rounded-xl font-mono font-bold text-sm 
                     tracking-widest uppercase overflow-hidden group
                     bg-gray-200 dark:bg-[#0f1e35] 
                     border border-gray-300 dark:border-sky-500/30 
                     text-gray-800 dark:text-sky-400
                     hover:border-sky-500 hover:text-sky-500
                     dark:hover:border-sky-400/60 dark:hover:text-sky-300
                     active:scale-[0.98] transition-all duration-200
                     disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span
              className="absolute inset-0 translate-x-[-100%] 
                           group-hover:translate-x-[100%] 
                           transition-transform duration-500 
                           bg-gradient-to-r from-transparent via-sky-500/10 to-transparent"
            />

            <span className="relative flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
                  connecting...
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 dark:bg-sky-400 animate-pulse" />
                  join room
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 dark:bg-sky-400 animate-pulse" />
                </>
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
