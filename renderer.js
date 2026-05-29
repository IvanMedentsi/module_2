let lastData = null;

function showModal() {
  document.getElementById("modal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("modal").classList.add("hidden");
}

async function run() {
  const docs = [
    document.getElementById("d1").value,
    document.getElementById("d2").value,
    document.getElementById("d3").value
  ].filter(text => text.trim() !== "");

  if (docs.length < 2) {
    showModal();
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