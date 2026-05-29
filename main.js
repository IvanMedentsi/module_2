const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const { analyze } = require("./backend");

let win;

// 🔹 LOG FILE
const logPath = path.join(__dirname, "app.log");

function log(message) {
  const time = new Date().toISOString();
  fs.appendFileSync(logPath, `[${time}] ${message}\n`);
}

function createWindow() {
  win = new BrowserWindow({
    width: 1000,
    height: 750,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true
    }
  });

  win.loadFile("index.html");

  log("App window created");
}

app.whenReady().then(() => {
  log("Application started");
  createWindow();
});

app.on("window-all-closed", () => {
  log("Application closed");

  if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("compare-texts", (e, docs) => {
  try {
    log(`Compare request received. Docs count: ${docs.length}`);

    const result = analyze(docs);

    log("Text comparison completed successfully");

    return {
      success: true,
      results: result
    };

  } catch (err) {
    log(`ERROR in compare-texts: ${err.message}`);

    return {
      success: false,
      error: "Comparison failed"
    };
  }
});

ipcMain.handle("export-report", (e, data) => {
  try {
    log("Export report started");

    const report = `
TEXT SIMILARITY REPORT
====================

${data.results.map(r =>
  `Document ${r.doc1} ↔ Document ${r.doc2} = ${r.similarity}%`
).join("\n")}
`;

    fs.writeFileSync("report.txt", report);

    log("Report saved successfully");

    return { success: true };

  } catch (err) {
    log(`ERROR exporting report: ${err.message}`);

    return { success: false };
  }
});