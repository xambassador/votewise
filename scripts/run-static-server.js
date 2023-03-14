const { spawn } = require("child_process");
const path = require("path");

const filePath = path.join(__dirname, "../static-server.sh");
const child = spawn("bash", [filePath], {
  detached: true,
  shell: true,
  stdout: "inherit",
});

child.stdout.on("data", (data) => {
  console.log(`stdout: ${data}`);
});

child.stderr.on("data", (data) => {
  console.log(`stderr: ${data}`);
});

child.on("close", (code) => {
  console.log(`child process exited with code ${code}`);
});

// handle ctrl+c
process.on("SIGINT", () => {
  console.log("SIGINT received, killing child process");
  child.kill();
  process.exit();
});
