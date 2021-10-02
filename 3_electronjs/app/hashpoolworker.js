/* Main part of worker function - worker_nlc_wink.js  */
const workerpool = require("workerpool");
const crypto = require("crypto");
const fs = require("fs");
const { chokidarLogger, sqliteLogger, workerPoolLogger } = require("./logger");

let startTime;
let endTime;
async function fileHasherThread(input) {
  file = input.pathId;
  fullPath = input.fullPath;
  syncDir = input.syncDir;

  const createHashFromFile = (file) =>
    new Promise((resolve, reject) => {
      const hash = crypto.createHash("sha256");
      startTime = new Date().getTime();

      fs.createReadStream(fullPath)
        .on("data", (data) => hash.update(data))
        .on("end", () => {
          endTime = new Date().getTime();
          const time = endTime - startTime;
          const seconds = time / 1000;
          resolve({
            tipo: "COMPLETED_OK",
            path: file,
            timeSpent: seconds,
            hash: hash.digest("hex"),
          });
        })
        .on("error", (err) => {
          workerPoolLogger.error(
            `ERRO!: ${err.name.split("Error: ")}: ${err.message}`
          );
          endTime = new Date().getTime();
          const time = endTime - startTime;
          const seconds = time / 1000;
          if (err.message.indexOf("EBUSY") !== -1) {
            resolve({ tipo: "ERROR_EBUSY", timeSpent: seconds, path: file });
          } else {
            resolve({
              tipo: "ERROR_UNKNOWN",
              timeSpent: seconds,
              name: err.name,
              message: err.message,
            });
          }
        });
    });

  workerPoolLogger.info(`WORKERPOOL THREAD: Executando Hash para: ${file}`);

  const result = await createHashFromFile(file);

  return Promise.resolve(result);
}
// create the worker and register its functions
workerpool.worker({
  fileHasherThread,
});
