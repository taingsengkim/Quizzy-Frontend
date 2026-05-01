import { QRCodeCanvas } from "qrcode.react";
export default function RoomQR({ roomId }: { roomId: string }) {
  const url = `http://localhost:3000/quizzes/multiplayer/join?roomId=${roomId}`;
  return (
    <div>
      <h2>Scan to join</h2>
      <QRCodeCanvas value={url} size={200} />{" "}
    </div>
  );
}
