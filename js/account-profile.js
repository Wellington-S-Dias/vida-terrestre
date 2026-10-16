(() => {
  const storageKey = "vidaTerrestreUsuario";
  const dialog = document.getElementById("profile-dialog");
  const form = document.getElementById("profile-form");
  const openButton = document.getElementById("edit-profile-button");
  const nameHeading = document.getElementById("account-name");
  const bioText = document.getElementById("account-bio");
  const photoImage = document.getElementById("account-photo");
  const bannerImage = document.getElementById("account-banner-image");
  const photoPreview = document.getElementById("photo-preview");
  const bannerPreview = document.getElementById("banner-preview");
  const photoFile = document.getElementById("photo-file");
  const bannerFile = document.getElementById("banner-file");
  const message = document.getElementById("profile-form-message");

  if (
    !dialog || !form || !openButton || !nameHeading || !bioText ||
    !photoImage || !bannerImage
  ) return;

  const defaults = {
    photo: photoImage.getAttribute("src"),
    banner: bannerImage.getAttribute("src"),
    bio: "Conte um pouco sobre você e sua conexão com a natureza.",
  };
  let profile = { name: nameHeading.textContent.trim(), bio: "", photo: "", banner: "" };
  let draftPhoto = "";
  let draftBanner = "";

  function readStoredProfile() {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || "{}");
      return stored && typeof stored === "object" ? stored : {};
    } catch {
      return {};
    }
  }

  function persistLocally(nextProfile) {
    const previous = readStoredProfile();
    const stored = { ...previous, ...nextProfile };
    try {
      localStorage.setItem(storageKey, JSON.stringify(stored));
    } catch {
      delete stored.photo;
      delete stored.banner;
      try {
        localStorage.setItem(storageKey, JSON.stringify(stored));
      } catch {
        // A private browsing quota may block local cache; the database is saved.
      }
    }
  }

  function render(nextProfile, persist = true) {
    profile = { ...profile, ...nextProfile };
    nameHeading.textContent = profile.name || "Minha Conta";
    bioText.textContent = profile.bio || defaults.bio;
    photoImage.src = profile.photo || defaults.photo;
    bannerImage.src = profile.banner || defaults.banner;
    photoImage.alt = `Foto de perfil de ${nameHeading.textContent}`;
    if (persist) {
      persistLocally(profile);
      window.dispatchEvent(new CustomEvent("account-updated", { detail: profile }));
    }
  }

  function showMessage(text, state = "error") {
    message.textContent = text;
    message.dataset.state = state;
    message.hidden = !text;
  }

  function populateForm() {
    form.elements.name.value = profile.name || "";
    form.elements.bio.value = profile.bio || "";
    photoFile.value = "";
    bannerFile.value = "";
    draftPhoto = profile.photo || "";
    draftBanner = profile.banner || "";
    photoPreview.src = draftPhoto || defaults.photo;
    bannerPreview.src = draftBanner || defaults.banner;
    showMessage("");
  }

  function imageFileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith("image/")) {
        reject(new Error("Selecione um arquivo de imagem válido."));
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        reject(new Error("A imagem deve ter no máximo 8 MB."));
        return;
      }

      const image = new Image();
      const temporaryUrl = URL.createObjectURL(file);
      image.onload = () => {
        const maxDimension = 1800;
        const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(temporaryUrl);
        const webp = canvas.toDataURL("image/webp", 0.84);
        resolve(
          webp.startsWith("data:image/webp,")
            ? webp
            : canvas.toDataURL("image/jpeg", 0.84),
        );
      };
      image.onerror = () => {
        URL.revokeObjectURL(temporaryUrl);
        reject(new Error("Não foi possível abrir essa imagem."));
      };
      image.src = temporaryUrl;
    });
  }

  photoFile.addEventListener("change", async () => {
    const file = photoFile.files?.[0];
    if (!file) return;
    try {
      draftPhoto = await imageFileToDataUrl(file);
      photoPreview.src = draftPhoto;
      showMessage("");
    } catch (error) {
      photoFile.value = "";
      showMessage(error.message);
    }
  });

  bannerFile.addEventListener("change", async () => {
    const file = bannerFile.files?.[0];
    if (!file) return;
    try {
      draftBanner = await imageFileToDataUrl(file);
      bannerPreview.src = draftBanner;
      showMessage("");
    } catch (error) {
      bannerFile.value = "";
      showMessage(error.message);
    }
  });

  document.getElementById("reset-photo").addEventListener("click", () => {
    draftPhoto = "";
    photoFile.value = "";
    photoPreview.src = defaults.photo;
  });
  document.getElementById("reset-banner").addEventListener("click", () => {
    draftBanner = "";
    bannerFile.value = "";
    bannerPreview.src = defaults.banner;
  });

  openButton.addEventListener("click", () => {
    populateForm();
    dialog.showModal();
  });
  document.getElementById("close-profile-dialog").addEventListener("click", () => dialog.close());
  document.getElementById("cancel-profile-edit").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const saveButton = form.querySelector('[type="submit"]');
    const nextProfile = {
      name: form.elements.name.value.trim(),
      bio: form.elements.bio.value.trim(),
      photo: draftPhoto,
      banner: draftBanner,
    };

    if (!nextProfile.name) {
      showMessage("Informe um nome de usuário.");
      form.elements.name.focus();
      return;
    }

    saveButton.disabled = true;
    showMessage("Salvando seu perfil…", "info");
    try {
      const response = await fetch("/usuario/perfil", {
        method: "PUT",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextProfile),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.erro || "Entre na sua conta para salvar o perfil.");
      }

      render(result.perfil || nextProfile);
      dialog.close();
    } catch (error) {
      showMessage(error.message || "Não foi possível salvar as alterações.");
    } finally {
      saveButton.disabled = false;
    }
  });

  const storedProfile = readStoredProfile();
  render(storedProfile, Boolean(storedProfile.name));
  fetch("/usuario/perfil", { credentials: "same-origin" })
    .then(async (response) => {
      if (!response.ok) return null;
      return response.json();
    })
    .then((data) => {
      if (data?.perfil) render(data.perfil);
    })
    .catch(() => {});

  window.addEventListener("account-updated", (event) => {
    if (event.detail && event.detail !== profile) {
      profile = { ...profile, ...event.detail };
      nameHeading.textContent = profile.name || "Minha Conta";
      bioText.textContent = profile.bio || defaults.bio;
      photoImage.src = profile.photo || defaults.photo;
      bannerImage.src = profile.banner || defaults.banner;
    }
  });
})();
