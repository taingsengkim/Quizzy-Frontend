"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useRef, Suspense } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { toast } from "sonner";
import JoinRoomComponent from "@/components/quiz/join-room";

export default function JoinRoomPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080b14]" />}>
      <JoinRoomComponent />
    </Suspense>
  );
}
