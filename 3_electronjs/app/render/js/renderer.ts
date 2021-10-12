const dragDrop = require("drag-drop");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'ipcRendere... Remove this comment to see the full error message
const { ipcRenderer } = require("electron");

// local dependencies
const dom = require("./dom");

/** ************************** */

// get list of files from the `main` process
ipcRenderer.invoke("app:get-files").then((files = []) => {
  dom.displayFiles(files);
});

// handle file delete event
ipcRenderer.on("app:delete-file", (event: any, filename: any) => {
  // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
  document.getElementById(filename).remove();
});

/** ************************** */

// add files drop listener
dragDrop("#uploader", (files: any) => {
  const _files = files.map((file: any) => {
    return {
      name: file.name,
      path: file.path,
    };
  });

  // send file(s) add event to the `main` process
  ipcRenderer.invoke("app:on-file-add", _files).then(() => {
    ipcRenderer.invoke("app:get-files").then((files = []) => {
      dom.displayFiles(files);
    });
  });
});

// open filesystem dialog
// @ts-expect-error ts-migrate(2339) FIXME: Property 'openDialog' does not exist on type 'Wind... Remove this comment to see the full error message
window.openDialog = () => {
  console.log("calling ipc to open dialog ");
  ipcRenderer.invoke("app:on-fs-dialog-open").then(() => {
    ipcRenderer.invoke("app:get-files").then((files = []) => {
      dom.displayFiles(files);
    });
  });
};
