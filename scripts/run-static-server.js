const { spawn, exec } = require("child_process");
const path = require("path");
/* ----------------------------------------------------------------------------------------------- */

const filePath = path.join(__dirname, "../static-server.sh");
const cmdFilePath = path.join(__dirname, "../static-server.cmd");
const macFilePath = path.join(__dirname, "../static-server-mac.sh");

const isWin = process.platform === "win32";
const isMac = process.platform === "darwin";

/* -----------------------------------------------------------------------------------------------
 * @function: executeWindowsScript
 * -----------------------------------------------------------------------------------------------*/
function executeWindowsScript() {
  const command = `start /wait /b cmd.exe /c "${cmdFilePath}"`;
  const child = exec(command, (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  });

  // handle ctrl+c
  process.on("SIGINT", () => {
    child.removeAllListeners();
    console.log("SIGINT received, killing child process");
    exec(`taskkill /PID ${child.pid} /T /F /WAIT`, (err) => {
      if (err) {
        console.error(`Error: ${err}`);
      }
    });
    process.exit();
  });
}

/* -----------------------------------------------------------------------------------------------
 * @function: executeLinuxScript
 * -----------------------------------------------------------------------------------------------*/
function executeLinuxScript() {
  const shellScript = isMac ? macFilePath : filePath;
  const child = spawn("bash", [shellScript], {
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
    child.kill("SIGINT");
    process.exit();
  });
}

/* ----------------------------------------------------------------------------------------------- */
if (isWin) executeWindowsScript();
executeLinuxScript();
