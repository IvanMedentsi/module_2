const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  compare: (docs) => ipcRenderer.invoke("compare-texts", docs),
  exportReport: (data) => ipcRenderer.invoke("export-report", data),
  readFiles: (files) => ipcRenderer.invoke("read-files", files)
});