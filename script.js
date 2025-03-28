// Results Slider
document.addEventListener('DOMContentLoaded', () => {
    const slider = document.querySelector('.results-slider');
    const cards = document.querySelectorAll('.result-card');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const dots = document.querySelectorAll('.slider-dot');
    const pageCount = document.querySelector('.slider-page-count');
    
    // スマートフォンかどうかを判定
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        // スマートフォン用のスライダー実装
        let currentIndex = 0;
        const totalSlides = cards.length;
        let autoPlayInterval;
        
        // スライドの更新関数
        const updateSlider = () => {
            // ドットの状態を更新
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex);
            });
            
            // ページカウンターを更新
            pageCount.textContent = `${currentIndex + 1} / ${totalSlides}`;
            
            // スライドを表示
            const cardWidth = cards[0].offsetWidth;
            const gap = 12; // gap between cards
            const scrollPosition = currentIndex * (cardWidth + gap);
            slider.scrollTo({
                left: scrollPosition,
                behavior: 'smooth'
            });
        };

        // 自動再生の開始
        const startAutoPlay = () => {
            autoPlayInterval = setInterval(() => {
                currentIndex = (currentIndex + 1) % totalSlides;
                updateSlider();
            }, 1000); // 1秒ごとにスライド
        };

        // 自動再生の停止
        const stopAutoPlay = () => {
            clearInterval(autoPlayInterval);
        };
        
        // スクロールイベントの監視（スクロール終了時に実行）
        let scrollTimeout;
        slider.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            stopAutoPlay(); // スクロール中は自動再生を停止
            
            scrollTimeout = setTimeout(() => {
                const cardWidth = cards[0].offsetWidth;
                const gap = 12;
                const scrollPosition = slider.scrollLeft;
                currentIndex = Math.round(scrollPosition / (cardWidth + gap));
                updateSlider();
                startAutoPlay(); // スクロール終了後に自動再生を再開
            }, 100);
        });
        
        // タッチイベントの監視
        slider.addEventListener('touchstart', () => {
            stopAutoPlay();
        });
        
        slider.addEventListener('touchend', () => {
            setTimeout(startAutoPlay, 1000);
        });
        
        // 前へボタンのクリックイベント
        prevBtn.addEventListener('click', () => {
            stopAutoPlay();
            if (currentIndex > 0) {
                currentIndex--;
                updateSlider();
            }
            setTimeout(startAutoPlay, 1000);
        });
        
        // 次へボタンのクリックイベント
        nextBtn.addEventListener('click', () => {
            stopAutoPlay();
            if (currentIndex < totalSlides - 1) {
                currentIndex++;
                updateSlider();
            }
            setTimeout(startAutoPlay, 1000);
        });
        
        // ドットのクリックイベント
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                stopAutoPlay();
                currentIndex = index;
                updateSlider();
                setTimeout(startAutoPlay, 1000);
            });
        });
        
        // 初期状態の設定と自動再生の開始
        updateSlider();
        startAutoPlay();
        
    } else {
        // 最初の3枚と最後の3枚をコピーしてループ用に追加
        const firstCards = Array.from(cards).slice(0, 3);
        const lastCards = Array.from(cards).slice(-3);
        
        lastCards.forEach(card => {
            const clone = card.cloneNode(true);
            slider.insertBefore(clone, slider.firstChild);
        });
        
        firstCards.forEach(card => {
            const clone = card.cloneNode(true);
            slider.appendChild(clone);
        });
        
        let currentIndex = 3; // 最初の3枚分オフセット
        const totalSlides = cards.length;
        let isTransitioning = false;
        
        // スライダーの更新関数
        const updateSlider = (withTransition = true) => {
            if (withTransition) {
                slider.style.transition = 'transform 0.5s ease';
            } else {
                slider.style.transition = 'none';
            }
            
            // スライダーの位置を更新
            const slideWidth = 100 / 3; // 3枚表示
            const offset = -currentIndex * slideWidth;
            slider.style.transform = `translateX(${offset}%)`;
            
            // ドットの状態を更新
            const actualIndex = ((currentIndex - 3 + totalSlides) % totalSlides);
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === actualIndex);
            });
            
            // ページカウンターを更新
            pageCount.textContent = `${actualIndex + 1} / ${totalSlides}`;
        };
        
        // 初期位置を設定
        updateSlider(false);
        
        // トランジション終了時の処理
        slider.addEventListener('transitionend', () => {
            isTransitioning = false;
            
            // 最後のクローンまで行ったら最初に戻る
            if (currentIndex >= totalSlides + 3) {
                currentIndex = 3;
                updateSlider(false);
            }
            // 最初のクローンまで行ったら最後に戻る
            else if (currentIndex <= 2) {
                currentIndex = totalSlides + 2;
                updateSlider(false);
            }
        });
        
        // 次へボタンのクリックイベント
        nextBtn.addEventListener('click', () => {
            if (isTransitioning) return;
            isTransitioning = true;
            currentIndex++;
            updateSlider();
        });
        
        // 前へボタンのクリックイベント
        prevBtn.addEventListener('click', () => {
            if (isTransitioning) return;
            isTransitioning = true;
            currentIndex--;
            updateSlider();
        });
        
        // ドットのクリックイベント
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                if (isTransitioning) return;
                isTransitioning = true;
                currentIndex = index + 3;
                updateSlider();
            });
        });
        
        // タッチスワイプ対応
        let touchStartX = 0;
        let touchEndX = 0;
        
        slider.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            slider.style.transition = 'none';
        });
        
        slider.addEventListener('touchmove', (e) => {
            if (isTransitioning) return;
            touchEndX = e.touches[0].clientX;
            const difference = touchStartX - touchEndX;
            const slideWidth = 100 / 3;
            const offset = -currentIndex * slideWidth - (difference / slider.offsetWidth * 100);
            slider.style.transform = `translateX(${offset}%)`;
        });
        
        slider.addEventListener('touchend', () => {
            if (isTransitioning) return;
            const difference = touchStartX - touchEndX;
            if (Math.abs(difference) > 50) { // 50px以上のスワイプで反応
                isTransitioning = true;
                if (difference > 0) {
                    currentIndex++;
                } else {
                    currentIndex--;
                }
                updateSlider();
            } else {
                updateSlider(); // 元の位置に戻る
            }
        });
        
        // 自動再生
        const autoPlayDelay = 5000; // 5秒ごとにスライド
        let autoPlayInterval = setInterval(() => {
            if (!isTransitioning) {
                isTransitioning = true;
                currentIndex++;
                updateSlider();
            }
        }, autoPlayDelay);
        
        // マウスホバー時に自動再生を一時停止
        slider.addEventListener('mouseenter', () => {
            clearInterval(autoPlayInterval);
        });
        
        slider.addEventListener('mouseleave', () => {
            autoPlayInterval = setInterval(() => {
                if (!isTransitioning) {
                    isTransitioning = true;
                    currentIndex++;
                    updateSlider();
                }
            }, autoPlayDelay);
        });
        
        // レスポンシブ対応
        window.addEventListener('resize', () => {
            updateSlider(false);
        });
    }
});

// FAQ Accordion
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        // Close all FAQ items
        faqItems.forEach(faqItem => {
            faqItem.classList.remove('active');
        });
        
        // Open clicked item if it wasn't active
        if (!isActive) {
            item.classList.add('active');
        }
    });
});

// Smooth Scroll for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Intersection Observer for Fade-in Animations
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Add fade-in animation to sections
document.querySelectorAll('section').forEach(section => {
    section.classList.add('fade-in-section');
    observer.observe(section);
});

// Add CSS for fade-in animation
const style = document.createElement('style');
style.textContent = `
    .fade-in-section {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease-out, transform 0.6s ease-out;
    }
    
    .fade-in-section.fade-in {
        opacity: 1;
        transform: translateY(0);
    }
`;
document.head.appendChild(style);

// Mobile Menu Toggle
const headerContainer = document.querySelector('.header-container');
const navMenu = document.querySelector('.nav-menu');

if (headerContainer && navMenu) {
    const menuButton = document.createElement('button');
    menuButton.className = 'menu-toggle';
    menuButton.innerHTML = `
        <span></span>
        <span></span>
        <span></span>
    `;
    
    headerContainer.insertBefore(menuButton, navMenu);
    
    menuButton.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        menuButton.classList.toggle('active');
    });
}

// Add CSS for mobile menu
const mobileMenuStyle = document.createElement('style');
mobileMenuStyle.textContent = `
    .menu-toggle {
        display: none;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.5rem;
        z-index: 100;
    }
    
    .menu-toggle span {
        display: block;
        width: 25px;
        height: 2px;
        background-color: var(--text-color);
        margin: 5px 0;
        transition: var(--transition);
    }
    
    @media (max-width: 768px) {
        .menu-toggle {
            display: block;
        }
        
        .menu-toggle.active span:nth-child(1) {
            transform: rotate(45deg) translate(5px, 5px);
        }
        
        .menu-toggle.active span:nth-child(2) {
            opacity: 0;
        }
        
        .menu-toggle.active span:nth-child(3) {
            transform: rotate(-45deg) translate(7px, -6px);
        }
        
        .nav-menu {
            position: fixed;
            top: 0;
            right: -100%;
            width: 80%;
            max-width: 300px;
            height: 100vh;
            background-color: var(--white);
            padding: 5rem 2rem 2rem;
            transition: var(--transition);
            box-shadow: var(--shadow-lg);
        }
        
        .nav-menu.active {
            right: 0;
        }
    }
`;
document.head.appendChild(mobileMenuStyle);

// Form Validation
const forms = document.querySelectorAll('form');

forms.forEach(form => {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Basic form validation
        const inputs = form.querySelectorAll('input[required], textarea[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.classList.add('error');
            } else {
                input.classList.remove('error');
            }
        });
        
        if (isValid) {
            // Show success message
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            successMessage.textContent = '送信が完了しました！';
            form.appendChild(successMessage);
            
            // Reset form
            setTimeout(() => {
                form.reset();
                successMessage.remove();
            }, 3000);
        }
    });
});

// Add CSS for form validation
const formStyle = document.createElement('style');
formStyle.textContent = `
    .error {
        border-color: var(--accent-color) !important;
    }
    
    .success-message {
        background-color: var(--primary-color);
        color: var(--white);
        padding: 1rem;
        border-radius: 8px;
        margin-top: 1rem;
        text-align: center;
        animation: slideIn 0.3s ease-out;
    }
    
    @keyframes slideIn {
        from {
            transform: translateY(-10px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(formStyle);

// Course filtering functionality
document.addEventListener('DOMContentLoaded', function() {
    const categoryButtons = document.querySelectorAll('.category-button');
    const courseCards = document.querySelectorAll('.course-card');

    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');

            const category = button.dataset.category;

            courseCards.forEach(card => {
                if (category === 'all' || card.dataset.category === category) {
                    card.style.display = 'block';
                    // Add animation
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 50);
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // Smooth scroll to course sections
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });

    // FAQ accordion functionality
    const courseFaqItems = document.querySelectorAll('.faq-item');

    courseFaqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question?.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all FAQ items
            courseFaqItems.forEach(faqItem => {
                faqItem.classList.remove('active');
            });
            
            // Open clicked item if it wasn't active
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
});

// Results slider functionality
const slider = document.querySelector('.results-slider');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const dots = document.querySelectorAll('.slider-dot');
const pageCount = document.querySelector('.slider-page-count');
const cards = document.querySelectorAll('.result-card');
const cardWidth = cards[0]?.offsetWidth || 0;
const gap = 24; // Gap between cards
let currentIndex = 0;
const cardsPerView = window.innerWidth > 1200 ? 3 : window.innerWidth > 768 ? 2 : 1;
const maxIndex = Math.max(0, cards.length - cardsPerView);

function updateSlider() {
    const offset = -(currentIndex * (cardWidth + gap));
    slider.style.transform = `translateX(${offset}px)`;
    
    // Update dots
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndex);
    });
    
    // Update page count
    pageCount.textContent = `${currentIndex + 1} / ${maxIndex + 1}`;
    
    // Update button states
    prevBtn.style.opacity = currentIndex === 0 ? '0.5' : '1';
    nextBtn.style.opacity = currentIndex === maxIndex ? '0.5' : '1';
}

prevBtn?.addEventListener('click', () => {
    if (currentIndex > 0) {
        currentIndex--;
        updateSlider();
    }
});

nextBtn?.addEventListener('click', () => {
    if (currentIndex < maxIndex) {
        currentIndex++;
        updateSlider();
    }
});

dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        currentIndex = index;
        updateSlider();
    });
});

// Initialize slider
updateSlider(); 