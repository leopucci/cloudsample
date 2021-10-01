/* Main part of worker function - worker_nlc_wink.js  */
const workerpool = require("workerpool");
const crypto = require("crypto");
const fs = require("fs");
//const sqlite3 = require('better-sqlite3-sqleet');
//var db = new sqlite3(dbFile, { verbose: console.log });
var startTime, endTime;

async function fileDeletionThread(input) {
  file = input.db;
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
          var time = endTime - startTime;
          var seconds = time / 1000;
          resolve({
            tipo: "COMPLETED_OK",
            path: file,
            timeSpent: seconds,
            hash: hash.digest("hex"),
          });
        })
        .on("error", (err) => {
          console.log(
            "ERRO!: " + err.name.split("Error: ") + ": " + err.message
          );
          endTime = new Date().getTime();
          var time = endTime - startTime;
          var seconds = time / 1000;
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

  console.log("DELETE THREAD: Executando Hash para: " + file);

  // var result = await createHashFromFile(file);

  return Promise.resolve(result);
}

// create the worker and register its functions
workerpool.worker({
  fileHasherThread: fileHasherThread,
  fileDeletionThread: fileDeletionThread,
});
