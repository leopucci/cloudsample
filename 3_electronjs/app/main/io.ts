// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'ipcMain'.
const { ipcMain } = require("electron");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'path'.
const path = require("path");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fs'.
const fs = require("fs-extra");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'os'.
const os = require("os");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'open'.
const open = require("open");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'chokidar'.
const chokidar = require("chokidar");

// local dependencies
const notification = require("./notification");

// get application directory
const appDir = path.resolve(os.homedir(), "electron-app-files");

/** ************************* */

// get the list of files
exports.getFiles = () => {
  const files = fs.readdirSync(appDir);

  return files.map((filename: any) => {
    const filePath = path.resolve(appDir, filename);
    const fileStats = fs.statSync(filePath);

    return {
      name: filename,
      path: filePath,
      size: Number(fileStats.size / 1000).toFixed(1), // kb
    };
  });
};

/** ************************* */

// add files
exports.addFiles = (files = []) => {
  // ensure `appDir` exists
  fs.ensureDirSync(appDir);

  // copy `files` recursively (ignore duplicate file names)
  files.forEach((file) => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'name' does not exist on type 'never'.
    const filePath = path.resolve(appDir, file.name);

    if (!fs.existsSync(filePath)) {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'path' does not exist on type 'never'.
      fs.copyFileSync(file.path, filePath);
    }
  });

  // display notification
  notification.filesAdded(files.length);
};

// delete a file
exports.deleteFile = (filename: any) => {
  const filePath = path.resolve(appDir, filename);

  // remove file from the file system
  if (fs.existsSync(filePath)) {
    fs.removeSync(filePath);
  }
};

// open a file
exports.openFile = (filename: any) => {
  const filePath = path.resolve(appDir, filename);

  // open a file using default application
  if (fs.existsSync(filePath)) {
    open(filePath);
  }
};

/*-----*/

// watch files from the application's storage directory
exports.watchFiles = (win: any) => {
  chokidar.watch(appDir).on("unlink", (filepath: any) => {
    win.webContents.send("app:delete-file", path.parse(filepath).base);
  });
};
