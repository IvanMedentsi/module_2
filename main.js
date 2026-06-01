const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const mammoth = require("mammoth");
const { analyze } = require("./backend");
const config = require("./config.json");

let win;

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
  log(`${config.appName} v${config.version} started`);
  createWindow();
});

app.on("window-all-closed", () => {
  log("Application closed");

  if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("read-files", async (e, files) => {
  try {
    log(`File reading started. Files count: ${files.length}`);

    const texts = [];

    for (const file of files) {
      const ext = path.extname(file.path).toLowerCase();

      if (ext === ".txt") {
        const text = fs.readFileSync(file.path, "utf-8");
        texts.push(text);
      } else if (ext === ".docx") {
        const result = await mammoth.extractRawText({ path: file.path });
        texts.push(result.value);
      } else {
        log(`Unsupported file format ignored: ${file.name}`);
      }
    }

    log("File reading completed successfully");

    return {
      success: true,
      texts
    };

  } catch (err) {
    log(`ERROR reading files: ${err.message}`);

    return {
      success: false,
      error: "File reading failed"
    };
  }
});

ipcMain.handle("compare-texts", (e, docs) => {
  try {
    log(`Compare request received. Docs count: ${docs.length}`);

    const result = analyze(docs);

    log("Text comparison completed successfully");

    return {
      success: true,
      results: result,
      analyzedAt: new Date().toISOString(),
      docsCount: docs.length
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

    const maxResult = data.results.reduce((max, item) => {
      return item.similarity > max.similarity ? item : max;
    }, data.results[0]);

    const report = `
${config.appName}
Version: ${config.version}

TEXT SIMILARITY REPORT
======================

Дата аналізу: ${data.analyzedAt}
Кількість документів: ${data.docsCount}

Результати порівняння:
${data.results.map(r =>
  `Document ${r.doc1} ↔ Document ${r.doc2} = ${r.similarity}% — ${r.level}`
).join("\n")}

Висновок:
Найбільший рівень збігу виявлено між Document ${maxResult.doc1} та Document ${maxResult.doc2}: ${maxResult.similarity}% — ${maxResult.level}.

Примітка:
Система визначає текстову подібність документів. Високий рівень збігу може свідчити про можливі запозичення та потребує додаткової перевірки.
`;

    fs.writeFileSync(config.reportFile, report);

    log("Report saved successfully");

    return { success: true };

  } catch (err) {
    log(`ERROR exporting report: ${err.message}`);

    return { success: false };
  }
});