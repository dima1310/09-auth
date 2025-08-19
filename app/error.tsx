"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "50vh",
        textAlign: "center",
        padding: "20px",
      }}
    >
      <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        Something went wrong!
      </h2>
      <button
        onClick={() => reset()}
        style={{
          padding: "10px 20px",
          backgroundColor: "#0070f3",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Try again
      </button>
    </div>
  );
}
