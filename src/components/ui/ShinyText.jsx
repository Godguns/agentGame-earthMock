import "./shinyText.css";

export function ShinyText({ text, speed = 3, className = "" }) {
  return (
    <span
      className={`shiny-text ${className}`}
      style={{ "--shiny-speed": `${speed}s` }}
    >
      {text}
    </span>
  );
}
