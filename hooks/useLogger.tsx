const logTypes = {
  info: console.info,
  warning: console.warn,
  error: console.error,
  default: console.log,
};

const showTime = false;

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
      const cutLabel = label.slice(0, 15);
      let printText = "";
      printText += showTime ? `[${timeDiff.padStart(9, " ")}ms]` : "";
      printText += `[${cutLabel.padEnd(15, " ")}]`;
      printText += "  ".repeat(level + 1);
      printText += msg;
      logTypes[type](printText);
    } catch (error) {
      console.log("Couldn't log: ", error);
    }
  };

  return {
    addLog,
  };
}
