"use client";

import { useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

type Player = {
  username: string;
  score?: number;
};

type RoomState = {
  roomCode: string;
  owner: string;
  participants: Player[];
  started: string;
  quizId?: number;
};

export default function MultiplayerQuizPage({ quizId }: { quizId: string }) {
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [connected, setConnected] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState<RoomState | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const subscriptionRef = useRef<any>(null);

  const addLog = (msg: string) =>
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);

  const normalizedUsername = username.trim().toLowerCase();

  const subscribeToRoomTopic = (clientInstance: Client, code: string) => {
    if (subscriptionRef.current) subscriptionRef.current.unsubscribe();

    const sub = clientInstance.subscribe(`/topic/room/${code}`, (message) => {
      const roomUpdate: RoomState = JSON.parse(message.body);
      setRoom(roomUpdate);
      addLog(
        `Room update — status: ${roomUpdate.status}, players: ${roomUpdate.players?.length ?? 0}`,
      );
    });
    subscriptionRef.current = sub;
  };

  const connectAndCreate = () => {
    if (!username) {
      alert("Please enter a username first.");
      return;
    }

    if (stompClient?.connected) {
      addLog("Creating room...");
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
      setConnected(true);
      addLog("Connected to server");
      client.subscribe("/user/queue/reply", (message) => {
        const newRoom: RoomState = JSON.parse(message.body);
        const code = newRoom.roomCode;
        addLog(`Room created! Code: ${code}`);
        setRoomCode(code);
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
        addLog("Creating room...");
        client.publish({
          destination: "/app/create-room",
          body: JSON.stringify({
            quizId: Number(quizId),
            username: normalizedUsername,
          }),
        });
      }, 100);
    };
    client.onStompError = (frame) => {
      console.error(frame);
      addLog("STOMP error: " + frame.headers?.message);
    };
    client.activate();
    setStompClient(client);
  };
  const connectAndJoin = () => {
    if (!username || !roomCode) {
      alert("Please enter a username and room code.");
      return;
    }
    if (stompClient?.connected) {
      addLog(`Joining room ${roomCode}...`);
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
      setConnected(true);
      addLog("Connected to server");
      subscribeToRoomTopic(client, roomCode);
      addLog(`Joining room ${roomCode}...`);
      client.publish({
        destination: "/app/join-room",
        body: JSON.stringify({ roomCode, username: normalizedUsername }),
      });
    };
    client.onStompError = (frame) => {
      console.error(frame);
      addLog("STOMP error: " + frame.headers?.message);
    };
    client.activate();
    setStompClient(client);
  };
  const handleStartRoom = () => {
    if (stompClient?.connected && roomCode) {
      addLog("Starting quiz...");
      stompClient.publish({
        destination: "/app/start-room",
        body: JSON.stringify({ roomCode, username: normalizedUsername }),
      });
    }
  };
  const isOwner = room?.owner?.trim().toLowerCase() === normalizedUsername;
  console.log(
    "Room owner:",
    room?.owner,
    "My username:",
    normalizedUsername,
    "isOwner?",
    isOwner,
  );
  console.log(room);
  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Multiplayer Lobby</h1>
      {!room && (
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Enter Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border p-3 rounded w-full"
          />
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Room Code (to join)"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              className="border p-3 rounded flex-grow"
            />
            <button
              onClick={connectAndJoin}
              className="bg-green-600 text-white px-4 rounded hover:bg-green-700"
            >
              Join
            </button>
          </div>
          <button
            onClick={connectAndCreate}
            className="bg-blue-600 text-white p-3 rounded-lg w-full font-semibold hover:bg-blue-700"
          >
            Create Room
          </button>
        </div>
      )}

      {room && (
        <div className="border rounded-xl p-4 space-y-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Room Code
              </p>
              <p className="text-3xl font-mono font-bold text-blue-600 tracking-widest">
                {room.roomCode}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Status
              </p>
              <span
                className={` inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  room.status === "STARTED"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {room.status}
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Players ({room.participants?.length ?? 0})
            </p>
            <ul className="space-y-1">
              {room.participants?.map((p) => (
                <li
                  key={p}
                  className="flex items-center gap-2 text-sm  border rounded px-3 py-2"
                >
                  <p className="text-black">{p}</p>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      p.username === room.owner ? "bg-blue-500" : "bg-green-500"
                    }`}
                  />
                  <span className="font-medium">{p.username}</span>
                  {p === room.owner && (
                    <span className="ml-auto text-xs text-gray-400">host</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
          {isOwner && room.started !== "STARTED" && (
            <button
              onClick={handleStartRoom}
              disabled={(room.participants?.length ?? 0) < 1}
              className="cursor-pointer  bg-purple-600 text-black p-3 rounded-lg w-full font-semibold hover:bg-purple-700 "
            >
              Start Quiz
            </button>
          )}
          {!isOwner && room.started !== "STARTED" && (
            <p className="text-center text-sm text-gray-400 italic">
              Waiting for host to start...
            </p>
          )}
        </div>
      )}
    </div>
  );
}
