"use client";

import { useEffect } from "react";

export default function VisitorTracker() {
  useEffect(() => {
    console.log("VisitorTracker Mounted 🚀");

    fetch("/api/notify", {
      method: "POST",
    })
      .then((res) => {
        console.log("Status:", res.status);
        return res.json();
      })
      .then((data) => console.log(data))
      .catch(console.error);
  }, []);

  return null;
}