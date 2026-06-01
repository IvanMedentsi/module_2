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

  const preparedFiles = files.map(file => ({
    name: file.name,
    path: file.path
  }));

  const response = await window.api.readFiles(preparedFiles);

  if (!response.success) {
    showModal("Не вдалося прочитати файли");
    return;
  }

  const texts = response.texts.filter(text => text.trim() !== "");

  const combinedFiles = loadedFiles.concat(texts);

  if (combinedFiles.length > 3) {
    showModal("У поточній версії аналізуються тільки перші 3 документи");
  }

  loadedFiles = combinedFiles.slice(0, 3);

  event.target.value = "";

  document.getElementById("d1").value = loadedFiles[0] || "";
  document.getElementById("d2").value = loadedFiles[1] || "";
  document.getElementById("d3").value = loadedFiles[2] || "";

  if (loadedFiles.length < 2) {
    showModal("Потрібно завантажити мінімум 2 непорожні документи для аналізу");
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

  if (!res.success) {
    showModal("Помилка під час аналізу документів");
    return;
  }

  lastData = res;

  document.getElementById("result").innerHTML =
    res.results.map(r =>
      `Doc ${r.doc1} ↔ Doc ${r.doc2}: <b>${r.similarity}%</b> — ${r.level}`
    ).join("<br>");
}

async function exportReport() {
  if (!lastData) {
    showModal("Спочатку виконайте аналіз документів");
    return;
  }

  const response = await window.api.exportReport(lastData);

  if (response.success) {
    alert("Звіт збережено у файл report.txt");
  } else {
    showModal("Не вдалося зберегти звіт");
  }
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