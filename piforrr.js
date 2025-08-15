  
        document.addEventListener('DOMContentLoaded', function () {
            const loadingOverlay = document.getElementById('loading-screen');
            window.addEventListener('load', () => { loadingOverlay.classList.add('hidden'); });
            AOS.init({ duration: 800, once: true, easing: 'ease-in-out-cubic' });

            const mobileNavToggler = document.getElementById('mobile-nav-toggler');
            const mobileLinksContainer = document.getElementById('mobile-links-container');
            const mobileNavIcon = mobileNavToggler.querySelector('i');
            mobileNavToggler.addEventListener('click', function () {
                mobileLinksContainer.classList.toggle('active');
                mobileNavIcon.className = mobileLinksContainer.classList.contains('active') ? 'fas fa-times' : 'fas fa-bars';
            });
            document.querySelectorAll('.mobile-nav-menu a').forEach(item => {
                item.addEventListener('click', () => {
                    if (mobileLinksContainer.classList.contains('active')) {
                        mobileLinksContainer.classList.remove('active');
                        mobileNavIcon.className = 'fas fa-bars';
                    }
                });
            });

            const themeButton = document.getElementById('theme-button');
            const documentBody = document.body;
            const setSiteTheme = (selectedTheme) => {
                documentBody.setAttribute('data-theme', selectedTheme);
                document.getElementById('theme-display-icon').className = selectedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
                localStorage.setItem('userTheme', selectedTheme);
                if (window.interactiveMap) {
                    const tileLayerUrl = selectedTheme === 'dark' ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
                    window.interactiveMap.eachLayer(layer => { if (layer instanceof L.TileLayer) layer.setUrl(tileLayerUrl); });
                }
            };
            themeButton.addEventListener('click', () => setSiteTheme(documentBody.dataset.theme === 'dark' ? 'light' : 'dark'));
            const preferredTheme = localStorage.getItem('userTheme') || 'light';

            const headerTextWrapper = document.querySelector('.header-text-container');
            window.addEventListener('scroll', () => { headerTextWrapper.style.transform = `translateY(${window.scrollY * 0.4}px)`; });

            const scriptMapping = { 'h': 'ᯂ', 'k': 'ᯄ', 'b': 'ᯅ', 'p': 'ᯇ', 'n': 'ᯉ', 'w': 'ᯋ', 'g': 'ᯎ', 'j': 'ᯐ', 'd': 'ᯑ', 'r': 'ᯒ', 'm': 'ᯔ', 't': 'ᯖ', 's': 'ᯘ', 'y': 'ᯛ', 'l': 'ᯞ', 'ng': 'ᯝ', 'ny': 'ᯠ', 'a': 'ᯀ', 'i': 'ᯤ', 'u': 'ᯥ', 'marks': { 'i': 'ᯪ', 'u': 'ᯫ', 'e': 'ᯭ', 'o': 'ᯬ' }, 'vowelKiller': '᯲' };
            const convertToBatakScript = (latinString) => {
                latinString = latinString.toLowerCase().replace(/c/g, 'k').replace(/f/g, 'p').replace(/v/g, 'b').replace(/z/g, 'j').replace(/q/g, 'k').replace(/x/g, 'ks').replace(/[^a-z0-9\s]/g, '');
                let batakResult = ''; const vowelChars = 'aiueo'; let index = 0;
                while (index < latinString.length) {
                    let twoChars = latinString.substring(index, index + 2); let oneChar = latinString[index];
                    let consonantBase = (scriptMapping[twoChars] && !vowelChars.includes(twoChars)) ? twoChars : oneChar;
                    if (scriptMapping[consonantBase] && !vowelChars.includes(consonantBase)) {
                        const baseLength = consonantBase.length; const nextVowel = latinString[index + baseLength];
                        if (nextVowel && 'ioue'.includes(nextVowel)) { batakResult += scriptMapping[consonantBase] + scriptMapping.marks[nextVowel]; index += baseLength + 1; }
                        else if (nextVowel && 'a' === nextVowel) { batakResult += scriptMapping[consonantBase]; index += baseLength + 1; }
                        else { batakResult += scriptMapping[consonantBase] + scriptMapping.vowelKiller; index += baseLength; }
                    } else {
                        const current_char = latinString[index];
                        if ('aiu'.includes(current_char)) batakResult += scriptMapping[current_char];
                        else if ('eo'.includes(current_char)) batakResult += scriptMapping['a'] + scriptMapping.marks[current_char];
                        else batakResult += current_char;
                        index++;
                    }
                }
                return batakResult;
            };

            const headerTitleElement = document.getElementById('dynamic-header-title');
            const titleSourceText = headerTitleElement.dataset.text;

            headerTitleElement.innerHTML = titleSourceText.split(' ').map(word => {
                const spanForWord = document.createElement('span');
                spanForWord.style.display = 'inline-block';
                spanForWord.innerHTML = word.split('').map((character, i) =>
                    `<span data-latin-char="${character}" data-aksara-char="${convertToBatakScript(character)}" style="transition-delay: ${i * 30}ms;">${character}</span>`
                ).join('');
                return spanForWord.outerHTML;
            }).join(' ');

            headerTitleElement.addEventListener('mouseenter', () => headerTitleElement.querySelectorAll('span[data-aksara-char]').forEach(span => { span.textContent = span.dataset.aksaraChar; span.classList.add('title-in-aksara'); }));
            headerTitleElement.addEventListener('mouseleave', () => headerTitleElement.querySelectorAll('span[data-latin-char]').forEach(span => { span.textContent = span.dataset.latinChar; span.classList.remove('title-in-aksara'); }));

            document.querySelectorAll('.interactive-aksara-text').forEach(element => { const baseText = element.textContent; element.setAttribute('data-original-text', baseText); element.addEventListener('mouseenter', () => { element.textContent = convertToBatakScript(element.getAttribute('data-original-text')); element.classList.add('in-aksara-font'); }); element.addEventListener('mouseleave', () => { element.textContent = element.getAttribute('data-original-text'); element.classList.remove('in-aksara-font'); }); });

            document.getElementById('convert-action-button').onclick = () => { document.getElementById('conversion-output').value = convertToBatakScript(document.getElementById('latin-input-field').value); };
            document.getElementById('clear-action-button').onclick = () => { document.getElementById('latin-input-field').value = ''; document.getElementById('conversion-output').value = ''; };
            document.getElementById('copy-action-button').onclick = () => { navigator.clipboard.writeText(document.getElementById('conversion-output').value).then(() => alert('Teks berhasil disalin!')); };

            window.interactiveMap = L.map('interactive-map-area').setView([2.6, 98.9], 9);
            const tileLayerUrl = preferredTheme === 'dark' ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
            L.tileLayer(tileLayerUrl, { maxZoom: 19, attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>' }).addTo(window.interactiveMap);
            [{ lat: 2.659, lon: 98.835, name: "Pulau Samosir" }, { lat: 2.668, lon: 98.868, name: "Desa Tomok" }, { lat: 2.553, lon: 98.683, name: "Parapat" }, { lat: 2.868, lon: 98.535, name: "Air Terjun Sipiso-piso" }, { lat: 2.500, lon: 99.066, name: "Bukit Holbung" }].forEach(point => { L.marker([point.lat, point.lon]).addTo(window.interactiveMap).bindPopup(`<b>${point.name}</b>`); });

            setSiteTheme(preferredTheme);

            const allsoalQuestions = [
                { prompt: 'Aksara Batak untuk "pa" adalah...', choices: ['ᯅ', 'ᯇ', 'ᯑ', 'ᯎ'], correct: 'ᯇ' },
                { prompt: 'Aksara `ᯉ᯲` dibaca...', choices: ['na', 'n', 'ni', 'nga'], correct: 'n' },
                { prompt: 'Bagaimana cara menulis "lima" dalam Aksara Batak?', choices: ['ᯞᯔ', 'ᯞᯪᯔ', 'ᯞᯔᯪ', 'ᯒᯪᯔ'], correct: 'ᯞᯪᯔ' },
                { prompt: 'Aksara Batak untuk "ga" adalah...', choices: ['ᯎ', 'ᯐ', 'ᯑ', 'ᯂ'], correct: 'ᯎ' },
                { prompt: 'Aksara `ᯂᯬ` dibaca...', choices: ['ha', 'hi', 'hu', 'ho'], correct: 'ho' },
                { prompt: 'Bagaimana cara menulis "anak" dalam Aksara Batak?', choices: ['ᯀᯉᯂ', 'ᯀᯉᯄ᯲', 'ᯀᯉᯄ', 'ᯀᯉ᯲ᯄ'], correct: 'ᯀᯉᯄ᯲' },
                { prompt: 'Aksara Batak untuk "ta" adalah...', choices: ['ᯖ', 'ᯑ', 'ᯐ', 'ᯘ'], correct: 'ᯖ' },
                { prompt: 'Aksara `ᯘᯮ` dibaca...', choices: ['sa', 'si', 'su', 'so'], correct: 'su' },
                { prompt: 'Bagaimana cara menulis "surat" dalam Aksara Batak?', choices: ['ᯘᯮᯒᯖ', 'ᯘᯒᯖ᯲', 'ᯘᯮᯒᯖ᯲', 'ᯘᯮᯒ᯲ᯖ'], correct: 'ᯘᯮᯒᯖ᯲' },
                { prompt: 'Aksara Batak untuk "da" adalah...', choices: ['ᯅ', 'ᯇ', 'ᯑ', 'ᯎ'], correct: 'ᯑ' },
                { prompt: 'Gabungan aksara `ᯇᯒ᯲` dibaca...', choices: ['para', 'par', 'pira', 'pa + ra'], correct: 'par' },
                { prompt: 'Bagaimana cara menulis "boru" dalam Aksara Batak?', choices: ['ᯅᯬᯒᯮ', 'ᯅᯒᯮ', 'ᯅᯬᯒ', 'ᯅᯒ'], correct: 'ᯅᯬᯒᯮ' },
                { prompt: 'Aksara Batak untuk "ra" adalah...', choices: ['ᯞ', 'ᯛ', 'ᯒ', 'ᯘ'], correct: 'ᯒ' },
                { prompt: 'Gabungan aksara `ᯀᯔ᯲` dibaca...', choices: ['ama', 'am', 'um', 'ma'], correct: 'am' },
                { prompt: 'Bagaimana cara menulis "dalan" dalam Aksara Batak?', choices: ['ᯑᯞᯉ', 'ᯑᯞᯉ᯲', 'ᯑᯞᯪᯉ', 'ᯑ᯲ᯞᯉ'], correct: 'ᯑᯞᯉ᯲' },
                { prompt: 'Aksara Batak untuk "sa" adalah...', choices: ['ᯘ', 'ᯂ', 'ᯛ', 'ᯓ'], correct: 'ᯘ' },
                { prompt: 'Aksara `ᯅᯬᯑᯖ᯲` dibaca...', choices: ['bodata', 'bodat', 'badat', 'bodta'], correct: 'bodat' },
                { prompt: 'Bagaimana cara menulis "horbo" (kerbau) dalam Aksara Batak?', choices: ['ᯂᯬᯒᯅᯬ', 'ᯂᯒᯅ', 'ᯂᯬᯒ᯲ᯅᯬ', 'ᯂᯬᯒ᯲ᯅ'], correct: 'ᯂᯬᯒ᯲ᯅᯬ' },
                { prompt: 'Aksara Batak untuk "ma" adalah...', choices: ['ᯉ', 'ᯔ', 'ᯝ', 'ᯐ'], correct: 'ᯔ' },
                { prompt: 'Aksara `ᯂᯮᯖ` dibaca...', choices: ['hata', 'hut', 'huta', 'hota'], correct: 'huta' }
            ];
            const soalPromptEl = document.getElementById('soal-prompt-display');
            const soalChoicesEl = document.getElementById('soal-choices-area');
            const soalFeedbackEl = document.getElementById('soal-result-message');
            const soalScoreEl = document.getElementById('soal-score-display');
            const soalProgressEl = document.getElementById('soal-counter');
            const soalNextButton = document.getElementById('soal-next-button');
            let soalCurrentIndex = 0, userScore = 0;

            function randomizeArray(arr) { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[arr[i], arr[j]] = [arr[j], arr[i]]; } }
            function rendersoalCard() {
                if (soalCurrentIndex >= allsoalQuestions.length) {
                    soalPromptEl.textContent = '🎉';
                    soalFeedbackEl.textContent = `Kuis Selesai! Skor Akhir Anda: ${userScore} dari ${allsoalQuestions.length}`;
                    soalChoicesEl.innerHTML = '';
                    soalNextButton.style.display = 'none'; return;
                }
                soalFeedbackEl.textContent = '';
                soalNextButton.style.display = 'none';
                soalChoicesEl.innerHTML = '';
                const currentItem = allsoalQuestions[soalCurrentIndex];
                soalPromptEl.textContent = currentItem.prompt;
                soalScoreEl.textContent = `Skor: ${userScore}`;
                soalProgressEl.textContent = `Soal ${soalCurrentIndex + 1}/${allsoalQuestions.length}`;
                const answerOptions = [...currentItem.choices];
                randomizeArray(answerOptions);
                const choicesWrapper = document.createElement('div');
                choicesWrapper.className = 'button-cluster';
                answerOptions.forEach(option => {
                    const button = document.createElement('button');
                    button.textContent = option;
                    button.classList.add('soal-answer-button');
                    button.addEventListener('click', () => validateAnswer(option, currentItem.correct));
                    choicesWrapper.appendChild(button);
                });
                soalChoicesEl.appendChild(choicesWrapper);
            }
            function validateAnswer(userChoice, correctChoice) {
                const choiceButtons = soalChoicesEl.querySelectorAll('.soal-answer-button');
                choiceButtons.forEach(btn => {
                    btn.disabled = true;
                    if (btn.textContent === correctChoice) btn.classList.add('correct');
                });
                if (userChoice === correctChoice) {
                    userScore++;
                    soalFeedbackEl.style.color = 'var(--feedback-correct)';
                    soalFeedbackEl.textContent = 'Benar! Jawaban Anda Tepat.';
                } else {
                    soalFeedbackEl.style.color = 'var(--feedback-incorrect)';
                    soalFeedbackEl.textContent = `Salah. Jawaban yang benar adalah "${correctChoice}".`;
                    choiceButtons.forEach(btn => { if (btn.textContent === userChoice) btn.classList.add('incorrect'); });
                }
                soalScoreEl.textContent = `Skor: ${userScore}`;
                soalNextButton.style.display = 'block';
            }
            soalNextButton.addEventListener('click', () => { soalCurrentIndex++; rendersoalCard(); });
            rendersoalCard();

            const practiceCharSet = [{ latin: 'A', batak: 'ᯀ' }, { latin: 'Ha', batak: 'ᯂ' }, { latin: 'Ka', batak: 'ᯄ' }, { latin: 'Ba', batak: 'ᯅ' }, { latin: 'Pa', batak: 'ᯇ' }, { latin: 'Na', batak: 'ᯉ' }, { latin: 'Ga', batak: 'ᯎ' }, { latin: 'Ja', batak: 'ᯐ' }, { latin: 'Da', batak: 'ᯑ' }, { latin: 'Ra', batak: 'ᯒ' }, { latin: 'Ma', batak: 'ᯔ' }, { latin: 'Ta', batak: 'ᯖ' }, { latin: 'Sa', batak: 'ᯘ' }, { latin: 'Ya', batak: 'ᯛ' }, { latin: 'Nga', batak: 'ᯝ' }, { latin: 'La', batak: 'ᯞ' }];
            let practiceCurrentIndex = 0; const gambarCanvas = document.getElementById('gambar-surface'); const canvasContext = gambarCanvas.getContext('2d'); let isUsergambar = false;
            const resizegambarCanvas = () => { const container = document.getElementById('menggambar-module'); gambarCanvas.width = container.clientWidth - 40; gambarCanvas.height = 300; displayPracticeCharacter(); };
            const displayPracticeCharacter = () => { canvasContext.clearRect(0, 0, gambarCanvas.width, gambarCanvas.height); const charData = practiceCharSet[practiceCurrentIndex]; document.getElementById('menggambar-prompt').textContent = `Latihan: ${charData.latin} (${charData.batak})`; canvasContext.font = '200px AksaraBatak'; canvasContext.fillStyle = 'rgba(128, 128, 128, 0.2)'; canvasContext.textAlign = 'center'; canvasContext.textBaseline = 'middle'; canvasContext.fillText(charData.batak, gambarCanvas.width / 2, gambarCanvas.height / 2); };
            const getPointerPosition = (event) => { const rect = gambarCanvas.getBoundingClientRect(); const scaleX = gambarCanvas.width / rect.width; const scaleY = gambarCanvas.height / rect.height; if (event.touches) return { x: (event.touches[0].clientX - rect.left) * scaleX, y: (event.touches[0].clientY - rect.top) * scaleY }; return { x: (event.clientX - rect.left) * scaleX, y: (event.clientY - rect.top) * scaleY }; };
            const begingambar = (e) => { e.preventDefault(); isUsergambar = true; const { x, y } = getPointerPosition(e); canvasContext.beginPath(); canvasContext.moveTo(x, y); };
            const continuegambar = (e) => { if (!isUsergambar) return; e.preventDefault(); const { x, y } = getPointerPosition(e); canvasContext.lineTo(x, y); canvasContext.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-accent-primary'); canvasContext.lineWidth = 4; canvasContext.lineCap = 'round'; canvasContext.lineJoin = 'round'; canvasContext.stroke(); };
            const finishgambar = () => { isUsergambar = false; };
            gambarCanvas.addEventListener('mousedown', begingambar); gambarCanvas.addEventListener('mousemove', continuegambar); gambarCanvas.addEventListener('mouseup', finishgambar); gambarCanvas.addEventListener('mouseleave', finishgambar); gambarCanvas.addEventListener('touchstart', begingambar); gambarCanvas.addEventListener('touchmove', continuegambar); gambarCanvas.addEventListener('touchend', finishgambar);
            document.getElementById('clear-gambar-btn').addEventListener('click', () => { canvasContext.clearRect(0, 0, gambarCanvas.width, gambarCanvas.height); displayPracticeCharacter(); });
            document.getElementById('next-char-btn').addEventListener('click', () => { practiceCurrentIndex = (practiceCurrentIndex + 1) % practiceCharSet.length; displayPracticeCharacter(); });
            document.getElementById('previous-char-btn').addEventListener('click', () => { practiceCurrentIndex = (practiceCurrentIndex - 1 + practiceCharSet.length) % practiceCharSet.length; displayPracticeCharacter(); });
            window.addEventListener('resize', resizegambarCanvas); resizegambarCanvas();

            const musicPlayer = document.getElementById('background-track'); const musicToggleButton = document.getElementById('music-toggle');
            musicToggleButton.addEventListener('click', function () { if (musicPlayer.paused) { musicPlayer.play().catch(e => { }); musicToggleButton.innerHTML = '<i class="fas fa-pause"></i>'; } else { musicPlayer.pause(); musicToggleButton.innerHTML = '<i class="fas fa-play"></i>'; } });

            const carouselTrack = document.getElementById('destination-carousel');
            if (carouselTrack) {
                const carouselPanels = Array.from(carouselTrack.getElementsByClassName('carousel-card'));
                const paginationContainer = document.getElementById('destination-carousel-pagination');
                if (carouselPanels.length > 0) {
                    let activeSlideIndex = 0; let touchStartCoord = 0; let touchEndCoord = 0; let autoPlayTimer = null;
                    const beginAutoPlay = () => { clearInterval(autoPlayTimer); autoPlayTimer = setInterval(advanceCarousel, 4000); };
                    const pauseAutoPlay = () => { clearInterval(autoPlayTimer); };
                    for (let i = 0; i < carouselPanels.length; i++) {
                        const indicator = document.createElement('button');
                        indicator.classList.add('pagination-indicator');
                        indicator.setAttribute('aria-label', `Go to slide ${i + 1}`);
                        indicator.addEventListener('click', () => navigateToPanel(i));
                        paginationContainer.appendChild(indicator);
                    }
                    const paginationIndicators = Array.from(paginationContainer.getElementsByClassName('pagination-indicator'));
                    function refreshCarouselView() {
                        const panelCount = carouselPanels.length;
                        carouselPanels.forEach((panel, i) => {
                            panel.classList.remove('is-carousel-center', 'is-carousel-left', 'is-carousel-right');
                            if (i === activeSlideIndex) panel.classList.add('is-carousel-center');
                            else if (i === (activeSlideIndex - 1 + panelCount) % panelCount) panel.classList.add('is-carousel-left');
                            else if (i === (activeSlideIndex + 1) % panelCount) panel.classList.add('is-carousel-right');
                        });
                        paginationIndicators.forEach((dot, i) => { dot.classList.toggle('is-indicator-active', i === activeSlideIndex); });
                    }
                    function navigateToPanel(index) { pauseAutoPlay(); activeSlideIndex = index; refreshCarouselView(); beginAutoPlay(); }
                    function advanceCarousel() { pauseAutoPlay(); activeSlideIndex = (activeSlideIndex + 1) % carouselPanels.length; refreshCarouselView(); beginAutoPlay(); }
                    function regressCarousel() { pauseAutoPlay(); activeSlideIndex = (activeSlideIndex - 1 + carouselPanels.length) % carouselPanels.length; refreshCarouselView(); beginAutoPlay(); }
                    carouselTrack.addEventListener('click', (event) => {
                        const clickedPanel = event.target.closest('.carousel-card');
                        if (!clickedPanel) return;
                        if (clickedPanel.classList.contains('is-carousel-right')) advanceCarousel();
                        else if (clickedPanel.classList.contains('is-carousel-left')) regressCarousel();
                    });
                    carouselTrack.addEventListener('touchstart', (e) => { pauseAutoPlay(); touchStartCoord = e.changedTouches[0].screenX; }, { passive: true });
                    carouselTrack.addEventListener('touchend', (e) => { touchEndCoord = e.changedTouches[0].screenX; processSwipe(); beginAutoPlay(); });
                    carouselTrack.addEventListener('mouseenter', pauseAutoPlay);
                    carouselTrack.addEventListener('mouseleave', beginAutoPlay);
                    function processSwipe() {
                        const swipeDistance = 50;
                        if (touchEndCoord < touchStartCoord - swipeDistance) { activeSlideIndex = (activeSlideIndex + 1) % carouselPanels.length; }
                        else if (touchEndCoord > touchStartCoord + swipeDistance) { activeSlideIndex = (activeSlideIndex - 1 + carouselPanels.length) % carouselPanels.length; }
                        refreshCarouselView();
                    }
                    navigateToPanel(0);
                }
            }
        });

document.addEventListener('DOMContentLoaded', function () {
            const itemPerHalaman = 5;
            
            const daftarMakananUtama = document.getElementById('daftar-makanan-utama');
            if(!daftarMakananUtama) return; 

            const semuaItemMakanan = Array.from(daftarMakananUtama.querySelectorAll('.item-kuliner'));
            const kontrolHalaman = document.getElementById('wadah-kontrol-halaman');
            
            if (semuaItemMakanan.length > 0 && kontrolHalaman) {
                const jumlahTotalItem = semuaItemMakanan.length;
                const jumlahTotalHalaman = Math.ceil(jumlahTotalItem / itemPerHalaman);
                let halamanSaatIni = 1;

                function tampilkanHalaman(nomorHalaman) {
                    halamanSaatIni = nomorHalaman;
                    const indeksAwal = (nomorHalaman - 1) * itemPerHalaman;
                    const indeksAkhir = indeksAwal + itemPerHalaman;

                    semuaItemMakanan.forEach((item, indeks) => {
                        item.style.display = (indeks >= indeksAwal && indeks < indeksAkhir) ? 'block' : 'none';
                    });
                    buatTombolHalaman();
                }

                function buatTombolHalaman() {
                    kontrolHalaman.innerHTML = '';

                    const tombolSebelumnya = document.createElement('button');
                    tombolSebelumnya.textContent = 'Sebelumnya';
                    tombolSebelumnya.classList.add('tombol-halaman');
                    tombolSebelumnya.disabled = halamanSaatIni === 1;
                    tombolSebelumnya.addEventListener('click', () => tampilkanHalaman(halamanSaatIni - 1));
                    kontrolHalaman.appendChild(tombolSebelumnya);

                    for (let i = 1; i <= jumlahTotalHalaman; i++) {
                        const tombolAngkaHalaman = document.createElement('button');
                        tombolAngkaHalaman.textContent = i;
                        tombolAngkaHalaman.classList.add('tombol-halaman');
                        if (i === halamanSaatIni) {
                            tombolAngkaHalaman.classList.add('aktif');
                        }
                        tombolAngkaHalaman.addEventListener('click', () => tampilkanHalaman(i));
                        kontrolHalaman.appendChild(tombolAngkaHalaman);
                    }

                    const tombolBerikutnya = document.createElement('button');
                    tombolBerikutnya.textContent = 'Berikutnya';
                    tombolBerikutnya.classList.add('tombol-halaman');
                    tombolBerikutnya.disabled = halamanSaatIni === jumlahTotalHalaman;
                    tombolBerikutnya.addEventListener('click', () => tampilkanHalaman(halamanSaatIni + 1));
                    kontrolHalaman.appendChild(tombolBerikutnya);
                }
                
                tampilkanHalaman(1); 
            }
        });
p