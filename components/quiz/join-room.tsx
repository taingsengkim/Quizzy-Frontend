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

    client.onConnect = () => {
      console.log("Connected, subscribing to room...");

      const subscription = client.subscribe(
        `/topic/room/${normalizedRoomCode}`,
        (message) => {
          try {
            const roomState = JSON.parse(message.body);

            client.deactivate(); // Clean up connection

            // Navigate to the clean quiz page with params
            router.push(
              `/quizzes/multiplayer/${roomState.quizId}?code=${normalizedRoomCode}&username=${normalizedUsername}`,
            );
          } catch (err) {
            console.error(err);
            toast.error("Failed to parse room data");
            setLoading(false);
          }
        },
      );

      // Join the room
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
      toast.error("Room not found or connection failed");
      setLoading(false);
    };

    client.onWebSocketError = () => {
      toast.error("WebSocket connection failed");
      setLoading(false);
    };

    // Safety timeout
    setTimeout(() => {
      if (loading) {
        client.deactivate();
        toast.error("Timeout: Could not join room");
        setLoading(false);
      }
    }, 7000);

    client.activate();
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080b14] px-4">
      <div className="relative w-full max-w-sm">
        <div className="absolute top-0 right-0 w-14 h-14 border-t-[1.5px] border-r-[1.5px] border-sky-500/20 rounded-tr-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-10 h-10 border-b-[1.5px] border-l-[1.5px] border-violet-500/15 rounded-bl-3xl pointer-events-none" />

        <div className="bg-[#0d1220] border border-slate-800 rounded-3xl p-7 space-y-5 font-mono text-white">
          <div className="inline-flex items-center gap-2 bg-[#0f1a2e] border border-[#1e3a5f] rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            <span className="text-sky-400 text-[11px] tracking-widest uppercase">
              multiplayer
            </span>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
              Join Room
            </h2>
            <p className="text-slate-500 text-xs mt-1">
              enter your code to jump in
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-widest text-slate-500">
              username
            </label>
            <input
              type="text"
              placeholder="your_handle"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#080e1c] border border-slate-800 rounded-xl px-4 py-3 text-sky-300 text-sm placeholder-slate-700 focus:outline-none focus:border-sky-500 transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-widest text-slate-500">
              room code
            </label>
            <input
              type="text"
              placeholder="e.g. XK-4821"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="w-full bg-[#080e1c] border border-slate-800 rounded-xl px-4 py-3 text-sky-300 text-sm placeholder-slate-700 focus:outline-none focus:border-sky-500 transition"
            />
          </div>

          <button
            onClick={handleJoin}
            disabled={loading}
            className="relative w-full py-3.5 rounded-xl font-mono font-bold text-sm tracking-widest uppercase overflow-hidden group
                bg-[#0f1e35] border border-sky-500/30 text-sky-400
                hover:border-sky-400/60 hover:text-sky-300
                active:scale-[0.98] transition-all duration-200
                disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 bg-gradient-to-r from-transparent via-sky-500/10 to-transparent" />
            <span className="relative flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
                  connecting...
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                  join room
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                </>
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
