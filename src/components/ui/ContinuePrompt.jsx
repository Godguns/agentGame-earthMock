export function ContinuePrompt({ visible }) {
  return (
    <div className={`continue-prompt ${visible ? "is-visible" : ""}`}>
      <p className="continue-prompt__hint">按下任意位置继续</p>
    </div>
  );
}
