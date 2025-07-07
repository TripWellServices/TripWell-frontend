import { useNavigate } from "react-router-dom";

export default function TripNotCreated() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "40px", maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "16px" }}>Trip Not Created</h1>
      <p style={{ fontSize: "16px", marginBottom: "32px" }}>
        Hey, sorry — it looks like your trip hasn't been created yet.
        <br />
        You can create a new trip or head back to the home screen to get started.
      </p>

      <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
        <button
          onClick={() => navigate("/tripwell/home")}
          style={{
            padding: "12px 20px",
            fontSize: "16px",
            fontWeight: "bold",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Head Home
        </button>

        <button
          onClick={() => navigate("/tripwell/createtrip")}
          style={{
            padding: "12px 20px",
            fontSize: "16px",
            fontWeight: "bold",
            backgroundColor: "#28a745",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Create Trip
        </button>
      </div>
    </div>
  );
}
