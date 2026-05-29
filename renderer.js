let lastData = null;
let loadedFiles = [];

function showModal(message = "Уведіть мінімум 2 документи для аналізу") {
  const modal = document.getElementById("modal");
  modal.querySelector("p").innerText = message;
  modal.classList.remove("hidden");
}

function closeModal() {
  document.getElementById("modal").classList.add("hidden");
}

document.getElementById("fileInput")?.addEventListener("change", async (event) => {
  const files = Array.from(event.target.files);

  if (files.length === 0) return;

  const texts = await Promise.all(files.map(f => f.text()));

  loadedFiles = loadedFiles.concat(texts);

  event.target.value = "";

  document.getElementById("d1").value = loadedFiles[0] || "";
  document.getElementById("d2").value = loadedFiles[1] || "";
  document.getElementById("d3").value = loadedFiles[2] || "";

  if (loadedFiles.length < 2) {
    showModal("Потрібно завантажити мінімум 2 файли для аналізу");
  }
});

async function run() {
  const docs = [
    document.getElementById("d1").value,
    document.getElementById("d2").value,
    document.getElementById("d3").value
  ].filter(text => text.trim() !== "");

  if (docs.length < 2) {
    showModal("Введіть або завантажте мінімум 2 документи");
    return;
  }

  const res = await window.api.compare(docs);

  lastData = res;

  document.getElementById("result").innerHTML =
    res.results.map(r =>
      `Doc ${r.doc1} ↔ Doc ${r.doc2}: <b>${r.similarity}%</b>`
    ).join("<br>");
}

async function exportReport() {
  if (!lastData) return;

  await window.api.exportReport(lastData);
  alert("Report saved as report.txt");
}

function clearAll() {
  document.getElementById("d1").value = "";
  document.getElementById("d2").value = "";
  document.getElementById("d3").value = "";

  document.getElementById("result").innerHTML = "";

  lastData = null;
  loadedFiles = [];

  const fileInput = document.getElementById("fileInput");
  if (fileInput) fileInput.value = "";
}