const { spawn } = require("child_process")
const os = require("os")

afterAll(async () => {
  if (os.platform() === "darwin") {
    spawn("pkill", ["-P", process.pid])
  }
})
