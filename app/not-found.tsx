import Link from "next/link";

export default function NotFound() {
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
      <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Not Found</h2>
      <p style={{ marginBottom: "2rem", color: "#666" }}>
        Could not find the requested page.
      </p>
      <Link
        href="/"
        style={{
          padding: "10px 20px",
          backgroundColor: "#0070f3",
          color: "white",
          textDecoration: "none",
          borderRadius: "5px",
        }}
      >
        Return Home
      </Link>
    </div>
  );
}
