require("fs").mkdirSync("C:\\Temp", { recursive: true });
require("fs").writeFileSync("C:\\Temp\\debug-output.xlsx", outputBuffer);
