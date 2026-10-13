(() => {
    const link = document.querySelector('.nav-menu .entrar');
    if (!link) return;

    const storageKey = 'vidaTerrestreUsuario';
    const currentUrl = new URL(window.location.href);
    if (currentUrl.searchParams.has('logout')) {
        localStorage.removeItem(storageKey);
        currentUrl.searchParams.delete('logout');
        window.history.replaceState({}, '', currentUrl);
    }

    function readAccount() {
        try {
            return JSON.parse(localStorage.getItem(storageKey) || 'null');
        } catch {
            localStorage.removeItem(storageKey);
            return null;
        }
    }

    function renderAccount(account) {
        if (!account?.name) return;

        const name = account.name.trim();
        const initials = name.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase();
        link.href = 'conta.html';
        link.setAttribute('aria-label', `Conta de ${name}`);
        link.replaceChildren();

        if (account.photo) {
            const avatar = document.createElement('img');
            avatar.className = 'account-avatar';
            avatar.src = account.photo;
            avatar.alt = '';
            link.append(avatar);
        } else {
            const avatar = document.createElement('span');
            avatar.className = 'account-avatar';
            avatar.setAttribute('aria-hidden', 'true');
            avatar.textContent = initials;
            link.append(avatar);
        }

        const label = document.createElement('span');
        label.className = 'nav-label';
        label.textContent = name;
        link.append(label);
    }

    renderAccount(readAccount());

    // Busca também logins Google/GitHub, cuja conta fica na sessão do servidor.
    fetch('/usuario', { credentials: 'same-origin' })
        .then(response => response.ok ? response.json() : null)
        .then(data => {
            const user = data?.usuario;
            if (!data?.logado || !user) return;

            const account = {
                name: user.name || user.displayName || user.username || user.email?.split('@')[0],
                email: user.email || user.emails?.[0]?.value || '',
                photo: user.photo || user.photos?.[0]?.value || user._json?.avatar_url || ''
            };
            if (!account.name) return;

            localStorage.setItem(storageKey, JSON.stringify(account));
            renderAccount(account);
        })
        .catch(() => {});

    window.addEventListener('storage', event => {
        if (event.key === storageKey) renderAccount(readAccount());
    });
})();
