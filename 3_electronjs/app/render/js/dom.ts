// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'ipcRendere... Remove this comment to see the full error message
const { ipcRenderer } = require("electron");

// copy file
// @ts-expect-error ts-migrate(2339) FIXME: Property 'copyFile' does not exist on type 'Window... Remove this comment to see the full error message
window.copyFile = function (event: any, itemId: any) {
  event.preventDefault();

  // get path of the file
  const itemNode = document.getElementById(itemId);
  // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
  const filepath = itemNode.getAttribute("data-filepath");

  // send event to the main thread
  ipcRenderer.send("app:on-file-copy", { id: itemId, filepath });
};

// delete file
// @ts-expect-error ts-migrate(2339) FIXME: Property 'deleteFile' does not exist on type 'Wind... Remove this comment to see the full error message
window.deleteFile = function (itemId: any) {
  // get path of the file
  const itemNode = document.getElementById(itemId);
  // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
  const filepath = itemNode.getAttribute("data-filepath");

  // send event to the main thread
  ipcRenderer.send("app:on-file-delete", { id: itemId, filepath });
};

// open file
// @ts-expect-error ts-migrate(2339) FIXME: Property 'openFile' does not exist on type 'Window... Remove this comment to see the full error message
window.openFile = function (itemId: any) {
  // get path of the file
  const itemNode = document.getElementById(itemId);
  // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
  const filepath = itemNode.getAttribute("data-filepath");

  // send event to the main thread
  ipcRenderer.send("app:on-file-open", { id: itemId, filepath });
};

exports.displayFiles = (files = []) => {
  const fileListElem = document.getElementById("filelist");
  // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
  fileListElem.innerHTML = "";

  files.forEach((file : any) => {
    const itemDomElem = document.createElement("div");
    itemDomElem.setAttribute("id", file.name); // set `id` attribute
    itemDomElem.setAttribute("class", "app__files__item"); // set `class` attribute
    itemDomElem.setAttribute("data-filepath", file.path); // set `data-filepath` attribute

    itemDomElem.innerHTML = `
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'name' does not exist on type 'never'.
            <img ondragstart='copyFile(event, "${file.name}")' src='../assets/document.svg' class='app__files__item__file'/>
            <div class='app__files__item__info'>
                // @ts-expect-error ts-migrate(2339) FIXME: Property 'name' does not exist on type 'never'.
                <p class='app__files__item__info__name'>${file.name}</p>
                // @ts-expect-error ts-migrate(2339) FIXME: Property 'size' does not exist on type 'never'.
                <p class='app__files__item__info__size'>${file.size}KB</p>
            </div>
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'name' does not exist on type 'never'.
            <img onclick='deleteFile("${file.name}")' src='../assets/delete.svg' class='app__files__item__delete'/>
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'name' does not exist on type 'never'.
            <img onclick='openFile("${file.name}")' src='../assets/open.svg' class='app__files__item__open'/>
        `;

    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    fileListElem.appendChild(itemDomElem);
  });
};
