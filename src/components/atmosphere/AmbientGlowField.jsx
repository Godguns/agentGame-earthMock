import "./ambientGlowField.css";

const DEFAULT_LAYERS = [
  { x: "14%", y: "18%", size: "34rem", delay: "0s", duration: "18s" },
  { x: "78%", y: "16%", size: "28rem", delay: "-4s", duration: "22s" },
  { x: "68%", y: "72%", size: "32rem", delay: "-9s", duration: "20s" },
  { x: "22%", y: "78%", size: "24rem", delay: "-6s", duration: "24s" },
];

export function AmbientGlowField({ variant = "silver" }) {
  return (
    <div
      className={`ambient-glow-field ambient-glow-field--${variant}`}
      aria-hidden="true"
    >
      <div className="ambient-glow-field__mist" />
      {DEFAULT_LAYERS.map((layer, index) => (
        <span
          key={`${variant}-${index}`}
          className="ambient-glow-field__orb"
          style={{
            "--glow-x": layer.x,
            "--glow-y": layer.y,
            "--glow-size": layer.size,
            "--glow-delay": layer.delay,
            "--glow-duration": layer.duration,
          }}
        />
      ))}
      <div className="ambient-glow-field__specks" />
    </div>
  );
}
