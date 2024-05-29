const LOG_TYPES = {
  info: console.info,
  warning: console.warn,
  error: console.error,
  default: console.log,
};

const SHOW_TIME = false;

export function useLogger() {
  const startTime = new Date().getTime();

  const addLog = (
    msg: string,
    label: string,
    level: number = 0,
    type: "error" | "warning" | "default" = "default"
  ) => {
    try {
      const timeDiff = String(new Date().getTime() - startTime);
      let printText = SHOW_TIME ? `[${timeDiff.padStart(9, " ")}ms] ` : " ";
      printText += `[${label.slice(0, 15).padEnd(15, " ")}]`;
      printText += "  ".repeat(level + 1);
      printText += msg;
      LOG_TYPES[type](printText);
    } catch (error) {
      LOG_TYPES["error"](`Couldn't log: ${JSON.stringify(error)}`);
    }
  };

  return {
    addLog,
  };
}
