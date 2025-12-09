document.addEventListener('DOMContentLoaded', function() {
    loadGifts();
    setupNavigation();
    updateStarsCounter();

    if (window.location.pathname.includes('market.html')) {
        sessionStorage.setItem('marketAnimationsPlayed', 'true');
    }
});

async function loadGifts() {
    try {
        const response = await fetch('gifts.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const gifts = await response.json();

        if (!Array.isArray(gifts)) {
            throw new Error('Не могу прочитать gifts.json');
        }
        
        const isMarketPage = window.location.pathname.includes('market.html');
        const containerId = isMarketPage ? 'market-container' : 'gifts-container';
        const container = document.getElementById(containerId);
        
        container.innerHTML = '';

        if (!isMarketPage) {
            const myGifts = gifts.filter(gift => !gift.hasOwnProperty('price') || gift.price === undefined);
            
            if (myGifts.length === 0) {
                const emptyState = createEmptyState();
                container.appendChild(emptyState);
                return;
            }

            myGifts.forEach(gift => {
                const giftCard = createGiftCard(gift, false);
                container.appendChild(giftCard);
            });
            
        } else {
            const marketGifts = gifts.filter(gift => gift.hasOwnProperty('price') && gift.price !== undefined);
            
            if (marketGifts.length === 0) {
                const emptyState = createEmptyState('Нет доступных подарков');
                container.appendChild(emptyState);
                return;
            }

            marketGifts.forEach((gift, index) => {
                const giftCard = createGiftCard(gift, true);
                container.appendChild(giftCard);

                const shouldAnimate = sessionStorage.getItem('marketAnimationsPlayed') !== 'true';
                if (shouldAnimate) {
                    setTimeout(() => {
                        giftCard.classList.add('market-entry');
                    }, index * 100);
                }
            });
        }
        
    } catch (error) {
        console.error('Ошибка загрузки подарков:', error);
        showNotification(`Ошибка загрузки: ${error.message}`);
        showEmptyState();
    }
}

function createEmptyState(text = 'У вас нет подарков') {
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'empty-state';
    emptyDiv.innerHTML = `<div class="empty-state-text">${text}</div>`;
    return emptyDiv;
}

function setupGiftAnimations(card) {
    let hasPlayedHover = false;
    
    card.addEventListener('mouseenter', function() {
        if (!hasPlayedHover) {
            this.classList.add('hover-animation');
            hasPlayedHover = true;
            
            setTimeout(() => {
                this.classList.remove('hover-animation');
            }, 600);
        }
        
        const gif = this.querySelector('.gif-image');
        if (gif && gif.src.includes('.gif')) {
            restartGif(gif);
        }
    });
}

function restartGif(gifElement) {
    const src = gifElement.src;
    gifElement.src = '';
    setTimeout(() => {
        gifElement.src = src;
    }, 50);
}

function showNotification(message, isSuccess = false) {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${isSuccess ? 'success' : ''}`;
    notification.innerHTML = `
        <i class="fas ${isSuccess ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);

    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(-50%) translateY(-20px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

function showEmptyState() {
    const container = document.getElementById('gifts-container') || 
                     document.getElementById('market-container');
    if (container) {
        container.innerHTML = '';
        const emptyState = createEmptyState('У вас нет подарков');
        container.appendChild(emptyState);
    }
}

function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            
            if (page === 'market') {
                sessionStorage.removeItem('marketAnimationsPlayed');
            }
            
            if (page === 'gifts' && !window.location.pathname.includes('index.html')) {
                window.location.href = 'index.html';
            } else if (page === 'market' && !window.location.pathname.includes('market.html')) {
                window.location.href = 'market.html';
            }
        });
    });
}

function updateStarsCounter() {
    const currentStars = 1488; 

    localStorage.setItem('fragmentStars', currentStars.toString());
    
    const starsElement = document.getElementById('stars-count');
    if (starsElement) {
        starsElement.textContent = currentStars;
    }
}

updateStarsCounter();

window.handleGifError = function(img) {
    img.onerror = null;
    return true;
};