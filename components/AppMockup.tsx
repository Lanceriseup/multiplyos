"use client";

// Shared, self-contained embed of the interactive Multiply OS app mockup
// (/public/mockup/dashboard.html). The mockup auto-scales to this container's
// width and reports its true rendered height back via postMessage, so the frame
// is sized exactly. Multiple instances can coexist (e.g. a desktop section and a
// mobile-only placement) — each only reacts to messages from its OWN iframe.
import { useEffect, useRef, useState } from "react";

const MOCKUP_SRC = "/mockup/dashboard.html";

export default function AppMockup({ initialHeight = 620 }: { initialHeight?: number }) {
  const [height, setHeight] = useState(initialHeight);
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      // Only respond to our own frame — other AppMockup instances post too.
      if (e.source !== frameRef.current?.contentWindow) return;
      const data = e.data as { osm?: number; h?: number } | undefined;
      if (data && data.osm && typeof data.h === "number" && data.h > 0) {
        setHeight(data.h);
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // Ask the frame for its height once it has loaded (defeats any message race).
  function requestHeight() {
    frameRef.current?.contentWindow?.postMessage("osm-req", "*");
  }

  return (
    <div
      className="mx-auto max-w-[1180px] overflow-hidden rounded-[14px]"
      style={{
        boxShadow:
          "0 22px 45px -28px rgba(20,20,20,0.22), 0 4px 12px -8px rgba(20,20,20,0.10)",
      }}
    >
      <iframe
        ref={frameRef}
        src={MOCKUP_SRC}
        title="Interactive preview of the Multiply OS dashboard"
        loading="lazy"
        onLoad={requestHeight}
        className="block w-full border-0"
        style={{ height }}
      />
    </div>
  );
}
