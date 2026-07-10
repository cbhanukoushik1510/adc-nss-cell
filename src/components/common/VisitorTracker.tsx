"use client";

import { useEffect } from "react";
import { sendVisitorNotification } from "@/lib/ntfy";

export default function VisitorTracker() {
  useEffect(() => {
    sendVisitorNotification();
  }, []);

  return null;
}