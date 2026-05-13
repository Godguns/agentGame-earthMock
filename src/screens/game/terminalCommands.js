export function runTerminalCommand(raw, handlers = {}) {
  const trimmed = (raw || "").trim();
  const parts = trimmed.split(/\s+/);
  const base = (parts[0] || "").toLowerCase();
  const arg = parts.slice(1).join(" ").trim().toLowerCase();

  if (!base) {
    return [];
  }

  if (base === "clear") {
    handlers.onClear?.();
    return [];
  }

  if (base === "help") {
    return [
      "available: help, clear, status, echo <text>, userControl",
      "open <messages|jobs|notes|files|browser|network|battery>",
    ];
  }

  if (base === "status") {
    return ["scene: bedroom / desk: online / shell: ready"];
  }

  if (base === "echo") {
    return [parts.slice(1).join(" ") || "(empty)"];
  }

  if (base === "usercontrol") {
    handlers.onUserControl?.();
    return ["opening user control..."];
  }

  if (base === "open" && arg) {
    if (["messages", "jobs", "notes", "files", "browser"].includes(arg)) {
      if (!handlers.onOpenApp) {
        return [`${arg} is not available on this device.`];
      }

      handlers.onOpenApp(arg);
      return [`opening ${arg}...`];
    }

    if (["network", "battery"].includes(arg)) {
      if (!handlers.onOpenQuickPanel) {
        return [`${arg} panel is not available on this device.`];
      }

      handlers.onOpenQuickPanel(arg);
      return [`opening ${arg} panel...`];
    }
  }

  return [`'${trimmed}' is not recognized.`];
}
