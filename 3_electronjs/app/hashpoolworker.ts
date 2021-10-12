/* Main part of worker function - worker_nlc_wink.js  */
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'workerpool... Remove this comment to see the full error message
const workerpool = require("workerpool");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'crypto'.
const crypto = require("crypto");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fs'.
const fs = require("fs");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'chokidarLo... Remove this comment to see the full error message
const { chokidarLogger, sqliteLogger, workerPoolLogger } = require("./logger");

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'startTime'... Remove this comment to see the full error message
let startTime: any;
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'endTime'.
let endTime;
async function fileHasherThread(input: any) {
  // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'file'. Did you mean 'File'?
  file = input.pathId;
  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'fullPath'.
  fullPath = input.fullPath;
  syncDir = input.syncDir;

  const createHashFromFile = (file: any) => new Promise((resolve, reject) => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'createHash' does not exist on type 'Cryp... Remove this comment to see the full error message
    const hash = crypto.createHash("sha256");
    startTime = new Date().getTime();

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'fullPath'.
    fs.createReadStream(fullPath)
      .on("data", (data: any) => hash.update(data))
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
      .on("error", (err: any) => {
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

  // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'file'. Did you mean 'File'?
  workerPoolLogger.info(`WORKERPOOL THREAD: Executando Hash para: ${file}`);

  // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'file'. Did you mean 'File'?
  const result = await createHashFromFile(file);

  return Promise.resolve(result);
}
// create the worker and register its functions
workerpool.worker({
  fileHasherThread,
});
