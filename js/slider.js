const statistics = [
    {
        number: 742,
        title: "ESPÉCIES",
        description: "cadastradas"
    },
    {
        number: 18,
        title: "HABITATS",
        description: "registrados"
    },
    {
        number: 6,
        title: "BIOMAS",
        description: "representados"
    },
    {
        number: 35,
        title: "ECOSSISTEMAS",
        description: "catalogados"
    }
];

document.addEventListener('DOMContentLoaded', () => {
    const statNumber = document.querySelector('.stat-number');
    const statTitle = document.querySelector('.stat-title');
    const statDescription = document.querySelector('.stat-description');
    const prevButton = document.querySelector('.slider-button.prev');
    const nextButton = document.querySelector('.slider-button.next');
    const statCard = document.querySelector('.stat-card');
    const dots = document.querySelectorAll('.dot');

    if (!statCard) return;

    let currentStatIndex = 0;
    let isAnimating = false;

    function showStatistic(direction = 'next') {
        if (isAnimating) return;
        isAnimating = true;

        const stat = statistics[currentStatIndex];
        const offset = direction === 'next' ? '-40px' : '40px';

        statCard.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
        statCard.style.opacity = '0';
        statCard.style.transform = `translateX(${offset})`;

        setTimeout(() => {
            if (statNumber) statNumber.textContent = stat.number;
            if (statTitle) statTitle.textContent = stat.title;
            if (statDescription) statDescription.textContent = stat.description;

            statCard.style.transition = 'none';
            statCard.style.transform = `translateX(${direction === 'next' ? '40px' : '-40px'})`;

            statCard.offsetHeight; // Reflow limpo sem flickering

            statCard.style.transition = 'opacity 0.45s ease, transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)';
            statCard.style.opacity = '1';
            statCard.style.transform = 'translateX(0)';

            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentStatIndex);
            });

            setTimeout(() => {
                isAnimating = false;
            }, 450);
        }, 250);
    }

    if (nextButton) {
        nextButton.addEventListener('click', () => {
            if (isAnimating) return;
            currentStatIndex = (currentStatIndex + 1) % statistics.length;
            showStatistic('next');
        });
    }

    if (prevButton) {
        prevButton.addEventListener('click', () => {
            if (isAnimating) return;
            currentStatIndex = (currentStatIndex - 1 + statistics.length) % statistics.length;
            showStatistic('prev');
        });
    }

    // Clique nos dots de navegação direta
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            if (isAnimating || index === currentStatIndex) return;
            const direction = index > currentStatIndex ? 'next' : 'prev';
            currentStatIndex = index;
            showStatistic(direction);
        });
    });

    // Inicialização da primeira estatística
    showStatistic('next');
});