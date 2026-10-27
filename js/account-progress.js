(() => {
  const request = (url) => fetch(url, { credentials: "same-origin" });
  const safe = (value) => String(value || "");
  const formatDate = (value) => new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
  const defaults = ["/src/images/icons/cards.png", "/src/images/index/amazônia.png"];
  let unlockedAchievements = [];

  function createActivityRow(item) {
    const row = document.createElement("article");
    row.className = "atividades-cards";
    const title = item.kind === "quiz"
      ? `Completou um quiz${item.nome ? ` sobre ${item.nome}` : ""}`
      : item.kind === "visualizacao"
        ? `${item.detail === "Espécie consultada" ? "Consultou" : "Descobriu"} ${item.nome || "uma espécie"}`
        : item.detail || "Nova atividade";
    row.innerHTML = '<div class="atividades-card-img"><img alt=""></div><div class="atividades-card-text"><h3></h3><p></p></div>';
    row.querySelector("img").src = item.imagem || defaults[0];
    row.querySelector("h3").textContent = title;
    row.querySelector("p").textContent = formatDate(item.created_at);
    return row;
  }

  function openCard(card) {
    let dialog = document.getElementById("collected-card-dialog");
    if (!dialog) {
      dialog = document.createElement("dialog"); dialog.id = "collected-card-dialog"; dialog.className = "collected-card-dialog";
      dialog.innerHTML = '<button type="button" aria-label="Fechar">×</button><img alt=""><h2></h2><p></p><small></small>';
      dialog.querySelector("button").addEventListener("click", () => dialog.close()); document.body.append(dialog);
    }
    dialog.querySelector("img").src = card.imagem || defaults[0];
    dialog.querySelector("img").alt = card.nome;
    dialog.querySelector("h2").textContent = card.nome;
    dialog.querySelector("p").textContent = card.nome_cientifico || "Espécie brasileira";
    dialog.querySelector("small").textContent = `Carta ${card.rarity}`;
    dialog.showModal();
  }

  function createAchievementCard(achievement, showDetails = false) {
    const card = document.createElement("article");
    card.className = "card-conquista";
    card.title = achievement.description || achievement.name;
    const image = document.createElement("img");
    image.src = achievement.icon;
    image.alt = "";
    const name = document.createElement("p");
    name.textContent = achievement.name;
    card.append(image, name);
    if (showDetails) {
      const description = document.createElement("small");
      description.className = "achievement-description";
      description.textContent = achievement.description || "Conquista desbloqueada.";
      card.append(description);
      if (achievement.unlocked_at) {
        const date = document.createElement("small");
        date.className = "achievement-date";
        date.textContent = `Desbloqueada em ${new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(achievement.unlocked_at))}`;
        card.append(date);
      }
    }
    return card;
  }

  function render(data) {
    const { stats, cards, activities, biomes, achievements } = data;
    const totalAnimals = Number(stats.total_cartas_catalogo) || 15;
    const values = document.querySelectorAll(".user-data h1");
    [stats.especies, stats.cartas, stats.publicacoes, stats.dias].forEach((n, i) => { if(values[i]) values[i].firstChild.textContent = n; });
    values[1]?.querySelector("small")?.replaceChildren(document.createTextNode(` / ${totalAnimals}`));
    const inventory = document.querySelector(".inventario");
    inventory.querySelector(".inventario-card-grid")?.remove();
    inventory.querySelector(".profile-empty-state")?.toggleAttribute("hidden", cards.length > 0);
    if (cards.length) {
      const grid = document.createElement("div"); grid.className = "inventario-card-grid";
      cards.forEach((card) => { const button = document.createElement("button"); button.className = `inventario-card ${card.rarity}`; button.type = "button"; button.innerHTML = `<img alt=""><span></span>`; button.querySelector("img").src = card.imagem || defaults[0]; button.querySelector("img").alt = card.nome; button.querySelector("span").textContent = card.nome; button.addEventListener("click", () => openCard(card)); grid.append(button); });
      inventory.append(grid);
    }
    const total = cards.length; document.querySelector(".simulacao span").textContent = total;
    document.querySelector(".simulacao").setAttribute("aria-label", `${total} de ${totalAnimals} cartas coletadas`);
    const progressDegrees = Math.min(100, total / Math.max(1, totalAnimals) * 100) * 3.6;
    document.querySelector(".simulacao").style.background = `conic-gradient(var(--active-color) 0deg ${progressDegrees}deg, #0b2d45 ${progressDegrees}deg 360deg)`;
    document.querySelector(".dados-text h3").innerHTML = `${total} <small>/ ${totalAnimals}</small>`;
    const counts = Object.fromEntries(["comum","rara","epica","lendaria"].map((r) => [r, cards.filter(c=>c.rarity===r).length]));
    document.querySelectorAll(".categoria .quantidade").forEach((node,index)=>node.textContent=counts[["comum","rara","epica","lendaria"][index]]);
    const activitySection = document.querySelector(".m-atividades"); activitySection.querySelector(".atividades-card-grid")?.remove();
    activitySection.querySelector(".profile-empty-state").hidden = activities.length > 0;
    const latestActivities = activities.slice(0, 4);
    if (latestActivities.length) { const list=document.createElement("div");list.className="atividades-card-grid";latestActivities.forEach((item)=>list.append(createActivityRow(item)));activitySection.append(list); }
    const allActivitiesButton = document.getElementById("view-all-activities");
    const hasMoreActivities = stats.total_atividades == null
      ? activities.length > latestActivities.length
      : Number(stats.total_atividades) > latestActivities.length;
    allActivitiesButton.hidden = !hasMoreActivities;
    const biomeSection=document.querySelector(".areas-favoritas"), oldGrid=biomeSection.querySelector(".area-card-grid");oldGrid.replaceChildren();
    biomeSection.querySelector(".profile-empty-state").hidden=biomes.length>0;
    const max=Math.max(1,...biomes.map(b=>b.seconds));biomes.forEach((b,index)=>{const card=document.createElement("article");card.className="area-card";const percent=Math.round(b.seconds/max*100);const minutes=Math.floor(b.seconds/60);card.innerHTML=`<div class="area-card-img"><img src="${defaults[1]}" alt=""></div><div class="area-card-text"><h3></h3><div class="quantidade-bar"><div class="quantidade-bar-data" style="width:${percent}%"></div><p>#${index+1} • ${minutes} min • ${percent}%</p></div></div>`;card.querySelector("h3").textContent=b.biome;oldGrid.append(card);});oldGrid.hidden=!biomes.length;
    const achievementSection=document.querySelector(".conquistas"), achievementGrid=achievementSection.querySelector(".conquistas-card-grid");achievementGrid.replaceChildren();achievementSection.querySelector(".profile-empty-state").hidden=achievements.length>0;
    unlockedAchievements = achievements;
    achievements.slice(0, 4).forEach((achievement)=>achievementGrid.append(createAchievementCard(achievement)));
    achievementGrid.hidden=!achievements.length;
    document.getElementById("view-all-achievements").hidden = achievements.length <= 4;
  }

  const activitiesDialog = document.getElementById("activities-dialog");
  document.getElementById("close-activities-dialog")?.addEventListener("click", () => activitiesDialog.close());
  activitiesDialog?.addEventListener("click", (event) => { if (event.target === activitiesDialog) activitiesDialog.close(); });
  document.getElementById("view-all-activities")?.addEventListener("click", async () => {
    const list = document.getElementById("all-activities-list");
    const message = document.getElementById("all-activities-message");
    list.replaceChildren();
    message.textContent = "Carregando atividades…";
    activitiesDialog.showModal();
    try {
      const response = await request("/usuario/atividades");
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.erro || "Não foi possível carregar as atividades.");
      result.atividades.forEach((item) => list.append(createActivityRow(item)));
      message.textContent = result.atividades.length ? "" : "Nenhuma atividade registrada ainda.";
    } catch (error) {
      message.textContent = error.message || "Não foi possível carregar as atividades.";
    }
  });

  const achievementsDialog = document.getElementById("achievements-dialog");
  document.getElementById("close-achievements-dialog")?.addEventListener("click", () => achievementsDialog.close());
  achievementsDialog?.addEventListener("click", (event) => { if (event.target === achievementsDialog) achievementsDialog.close(); });
  document.getElementById("view-all-achievements")?.addEventListener("click", () => {
    const list = document.getElementById("all-achievements-list");
    list.replaceChildren(...unlockedAchievements.map((achievement) => createAchievementCard(achievement, true)));
    achievementsDialog.showModal();
  });

  request("/usuario/progresso").then(async response=>{if(response.status===401){document.querySelectorAll(".profile-empty-state").forEach(el=>el.textContent="Entre na sua conta para acompanhar seu progresso.");return null;}return response.ok?response.json():null;}).then(data=>data&&render(data)).catch(()=>{});
})();
