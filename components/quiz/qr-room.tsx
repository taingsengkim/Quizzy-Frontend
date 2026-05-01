"use client";

import { QRCodeCanvas } from "qrcode.react";

export default function RoomQR({ roomId }: { roomId: string }) {
  // const url = `http://localhost:3000/quizzes/multiplayer/join?code=${roomId}`;
  const url = `https://www.quizzy.it.com/quizzes/multiplayer/join?code=${roomId}`;

  return (
    <div>
      <QRCodeCanvas
        value={url}
        size={180}
        bgColor="#ffffff"
        fgColor="#0f172a"
        level="H"
      />{" "}
    </div>
  );
}
