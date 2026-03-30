const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("kinelab", {
  platform: "desktop"
});
