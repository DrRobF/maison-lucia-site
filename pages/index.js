export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f7f3ee",
        color: "#2f2a26",
        fontFamily: "Arial, sans-serif",
        padding: "40px",
        textAlign: "center",
      }}
    >
      <div>
        <p style={{ letterSpacing: "0.2em", fontSize: "12px", marginBottom: "16px" }}>
          MAISON LUCIA LLC
        </p>
        <h1 style={{ fontSize: "56px", margin: "0 0 16px 0" }}>
          Event Planning & Styling
        </h1>
        <p style={{ fontSize: "18px", maxWidth: "600px", lineHeight: 1.6, margin: "0 auto 24px" }}>
          Beautifully curated events with thoughtful details, elegant styling, and a seamless setup
          experience.
        </p>
        <button
          style={{
            background: "#2f2a26",
            color: "white",
            border: "none",
            padding: "14px 24px",
            borderRadius: "999px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          Inquire Now
        </button>
      </div>
    </main>
  );
}
