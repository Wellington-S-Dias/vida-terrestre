(() => {
  const dialog = document.getElementById("animal-quiz-dialog");
  const button = document.getElementById("start-animal-quiz");
  const form = document.getElementById("animal-quiz-form");
  const questionsNode = document.getElementById("animal-quiz-questions");
  const message = document.getElementById("animal-quiz-message");
  const title = document.getElementById("animal-quiz-title");
  const submitButton = form?.querySelector('[type="submit"]');
  const speciesInfo = document.getElementById("animal-quiz-species-info");
  const questionsPanel = document.getElementById("animal-quiz-questions");
  const reward = document.getElementById("animal-quiz-reward");
  let animal = null;
  if (!dialog || !button || !form) return;

  window.addEventListener("animal-opened", (event) => {
    animal = event.detail;
    const animalId = Number(animal?.id);
    button.hidden = !animalId || (animalId % 2 !== 0 && animalId % 5 !== 0);
  });

  async function carregarPerguntas() {
    const response = await fetch("/quiz/iniciar", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ animalId: animal.id }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.erro || "Entre na sua conta para participar.");
    questionsNode.replaceChildren();
    result.questions.forEach((question, index) => {
      const fieldset = document.createElement("fieldset");
      const legend = document.createElement("legend");
      legend.textContent = `${index + 1}. ${question.question}`;
      fieldset.append(legend);
      question.options.forEach((option, optionIndex) => {
        const label = document.createElement("label");
        const input = document.createElement("input");
        input.type = "radio";
        input.name = `q${index}`;
        input.value = optionIndex;
        input.required = true;
        label.append(input, document.createTextNode(` ${option}`));
        fieldset.append(label);
      });
      questionsNode.append(fieldset);
    });

    if (submitButton) submitButton.disabled = false;
  }

  button.addEventListener("click", async () => {
    title.textContent = `Quiz: ${animal?.nome || "espécie"}`;
    questionsNode.replaceChildren();
    questionsPanel.hidden = false;
    speciesInfo.hidden = false;
    reward.hidden = true;
    document.getElementById("quiz-animal-biome").textContent = animal?.bioma || animal?.biomas || "Informação não disponível";
    document.getElementById("quiz-animal-habitat").textContent = animal?.habitat || "Informação não disponível";
    document.getElementById("quiz-animal-diet").textContent = animal?.alimentacao || "Informação não disponível";
    message.textContent = "Carregando perguntas…";
    if (submitButton) submitButton.textContent = "Concluir quiz";
    if (submitButton) submitButton.disabled = true;
    dialog.showModal();
    try {
      await carregarPerguntas();
      message.textContent = "Acerte todas as perguntas para ganhar uma carta deste animal.";
    } catch (error) {
      message.textContent = error.message || "Não foi possível carregar o quiz.";
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });

  document.getElementById("close-animal-quiz")?.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submitButton) submitButton.disabled = true;
    const answers = [...questionsNode.querySelectorAll("fieldset")].map((_, index) => Number(form.elements[`q${index}`].value));
    try {
      const response = await fetch("/quiz/concluir", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.erro || "Não foi possível registrar o resultado.");
      message.textContent = result.message || "Não foi possível registrar o resultado.";

      if (result.correct) {
        questionsPanel.hidden = true;
        speciesInfo.hidden = true;
        reward.hidden = false;
        const rewardImage = document.getElementById("animal-quiz-reward-image");
        reward.querySelector(".animal-quiz-eyebrow").textContent = result.alreadyOwned ? "CARTA DA SUA COLEÇÃO" : "NOVA CARTA";
        rewardImage.src = animal?.imagem || "/src/images/icons/cards.png";
        rewardImage.alt = `Carta de ${animal?.nome || "animal"}`;
        document.getElementById("animal-quiz-reward-name").textContent = animal?.nome || "Carta conquistada";
        document.getElementById("animal-quiz-reward-rarity").textContent = `Raridade: ${result.rarity || "comum"}`;
        if (submitButton) submitButton.textContent = result.alreadyOwned ? "Carta na coleção" : "Carta conquistada";
        window.setTimeout(() => dialog.close(), 2400);
        return;
      }

      await carregarPerguntas();
      message.textContent = `${result.message || "Não foi dessa vez."} Um novo quiz já está pronto para você tentar novamente.`;
    } catch (error) {
      message.textContent = error.message || "Não foi possível registrar o resultado.";
    } finally {
      if (submitButton && submitButton.textContent !== "Carta conquistada") submitButton.disabled = false;
    }
  });
})();
