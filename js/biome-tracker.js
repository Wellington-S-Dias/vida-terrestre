(() => {
  let lastBiome = "";
  let lastSent = Date.now();
  const flush = () => {
    const now = Date.now();
    const seconds = Math.min(300, Math.floor((now - lastSent) / 1000));
    const current = document.body.dataset.biome || "";
    if (lastBiome && seconds >= 5) fetch("/usuario/bioma-tempo", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ biome: lastBiome, seconds }) }).catch(() => {});
    const names = { amazonia: "Amazônia", cerrado: "Cerrado", caatinga: "Caatinga", pantanal: "Pantanal", pampa: "Pampa", mataatlantica: "Mata Atlântica", "mata-atlantica": "Mata Atlântica" };
    lastBiome = current && current !== "default" ? (names[current] || current) : "";
    lastSent = now;
  };
  window.addEventListener("biome-selected", (event) => {
    flush();
    const biome = String(event.detail?.name || "");
    if (!biome) return;
    fetch("/usuario/bioma-tempo", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ biome, seconds: 1 }) }).catch(() => {});
    lastBiome = biome;
    lastSent = Date.now();
  });
  setInterval(flush, 30000);
  window.addEventListener("pagehide", flush);
})();
