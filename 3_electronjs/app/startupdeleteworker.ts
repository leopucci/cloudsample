/* Main part of worker function - worker_nlc_wink.js  */
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'workerpool... Remove this comment to see the full error message
const workerpool = require("workerpool");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'crypto'.
const crypto = require("crypto");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fs'.
const fs = require("fs");
// const sqlite3 = require('better-sqlite3-sqleet');
// var db = new sqlite3(dbFile, { verbose: console.log });
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'startTime'... Remove this comment to see the full error message
let startTime;
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'endTime'.
let endTime;

async function fileDeletionThread(input: any) {
  const file = input.db;
  const { fullPath } = input;
  const { syncDir } = input;

  const createHashFromFile = (file: any) => new Promise((resolve, reject) => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'createHash' does not exist on type 'Cryp... Remove this comment to see the full error message
    const hash = crypto.createHash("sha256");
    startTime = new Date().getTime();

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
        console.log(`ERRO!: ${err.name.split("Error: ")}: ${err.message}`);
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

  console.log(`DELETE THREAD: Executando Hash para: ${file}`);

  // var result = await createHashFromFile(file);

  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'result'.
  return Promise.resolve(result);
}

// create the worker and register its functions
workerpool.worker({
  fileHasherThread,
  fileDeletionThread,
});
