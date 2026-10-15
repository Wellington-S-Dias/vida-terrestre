(() => {
    const storageKey = 'vidaTerrestreUsuario';
    const dialog = document.getElementById('profile-dialog');
    const form = document.getElementById('profile-form');
    const bannerImage = document.querySelector('.account-banner > img');
    const profileImage = document.querySelector('.profile-image img');
    const nameHeading = document.getElementById('account-name');
    const quote = document.getElementById('account-quote');
    const openButton = document.getElementById('edit-profile-button');
    const errorMessage = document.getElementById('profile-form-error');

    if (!dialog || !form || !bannerImage || !profileImage || !nameHeading || !quote || !openButton) return;

    const defaults = {
        banner: bannerImage.src,
        photo: profileImage.src,
        quote: quote.textContent.replace(/^"|"$/g, '')
    };

    function readAccount() {
        try {
            return JSON.parse(localStorage.getItem(storageKey) || '{}');
        } catch {
            return {};
        }
    }

    function applyAccount(account) {
        nameHeading.textContent = account.name || 'Minha Conta';
        bannerImage.src = account.banner || defaults.banner;
        profileImage.src = account.photo || defaults.photo;
        quote.textContent = `"${account.quote || defaults.quote}"`;
    }

    function fillForm() {
        const account = readAccount();
        form.elements.name.value = account.name || nameHeading.textContent;
        form.elements.banner.value = account.banner || '';
        form.elements.photo.value = account.photo || '';
        form.elements.quote.value = account.quote || defaults.quote;
    }

    openButton.addEventListener('click', () => {
        fillForm();
        errorMessage.hidden = true;
        dialog.showModal();
    });

    document.getElementById('close-profile-dialog').addEventListener('click', () => dialog.close());
    document.getElementById('cancel-profile-edit').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
        if (event.target === dialog) dialog.close();
    });

    form.addEventListener('submit', async event => {
        event.preventDefault();
        errorMessage.hidden = true;
        const previous = readAccount();
        const account = {
            ...previous,
            name: form.elements.name.value.trim(),
            banner: form.elements.banner.value.trim(),
            photo: form.elements.photo.value.trim(),
            quote: form.elements.quote.value.trim()
        };

        if (!account.name) {
            form.elements.name.focus();
            return;
        }

        const saveButton = form.querySelector('[type="submit"]');
        saveButton.disabled = true;
        try {
            const response = await fetch('/usuario/perfil', {
                method: 'PUT',
                credentials: 'same-origin',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(account)
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(result.erro || 'Não foi possível salvar o perfil.');

            localStorage.setItem(storageKey, JSON.stringify(account));
            applyAccount(account);
            window.dispatchEvent(new CustomEvent('account-updated', { detail: account }));
            dialog.close();
        } catch (error) {
            errorMessage.textContent = error.message || 'Falha ao conectar ao servidor.';
            errorMessage.hidden = false;
        } finally {
            saveButton.disabled = false;
        }
    });

    applyAccount(readAccount());
    window.addEventListener('storage', event => {
        if (event.key === storageKey) applyAccount(readAccount());
    });
    window.addEventListener('account-updated', event => applyAccount(event.detail || readAccount()));
})();
