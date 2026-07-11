"use client";

import { useEffect, useState } from "react";
import {
  registerVisitor,
  getVisitorCount,
} from "@/lib/visitor";
import { Globe } from "lucide-react";

export default function VisitorCounter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    async function load() {
      await registerVisitor();

      const data = await getVisitorCount();

      setCount(data.visitorCount);
    }

    load();
  }, []);

  return (
  <div className="text-center">
    <p className="text-sm text-gray-300 flex items-center justify-center gap-2">
      
      🌐 Website Visitors
    </p>

    <p className="mt-1 text-2xl font-bold text-white">
      {count.toLocaleString()}
    </p>
  </div>
);
}