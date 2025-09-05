document.addEventListener('DOMContentLoaded', () => {
    const LS_PREFIX = 'studioAcorde_';

    function saveToLS(key, data) {
        try {
            localStorage.setItem(LS_PREFIX + key, JSON.stringify(data));
        } catch (e) {
            console.error(`Erro ao salvar ${key} no Local Storage:`, e);
        }
    }

    function loadFromLS(key, defaultValue) {
        try {
            const data = localStorage.getItem(LS_PREFIX + key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error(`Erro ao carregar ${key} do Local Storage:`, e);
            return defaultValue;
        }
    }

    const appState = {
        students: loadFromLS('students', []),
        levels: loadFromLS('levels', [
            { level: 1, xp: 0, name: "Iniciante", color: "rgba(255, 107, 14, 1)" }, 
            { level: 2, xp: 100, name: "Explorador", color: "#c77619ff" },
            { level: 3, xp: 250, name: "Harmonizador", color: "#aa8957c2" },
            { level: 4, xp: 500, name: "Artista Criativo", color: "#533826ff" },
            { level: 5, xp: 1000, name: "Mestre Acorde", color: "#3d2c15ff" },
            { level: 6, xp: 2000, name: "Lenda Musical", color: "#2e1b09ff" }
        ]),
        achievements: loadFromLS('achievements', [
            { id: 1, name: "Primeiros Passos", description: "Conclua a primeira tarefa.", xpRequirement: 100, icon: "images/achievements/achievement_primeiros_passos.jpg" },
            { id: 2, name: "Mestre Iniciante", description: "Alcance 500 pontos no jogo de piano.", xpRequirement: 500, icon: "images/achievements/achievement_mestre_iniciante.jpg" },
            { id: 3, name: "Explorador", description: "Alcance 1000 pontos no jogo de piano.", xpRequirement: 1000, icon: "images/achievements/achievement_explorador.jpg" },
            { id: 4, name: "Aventureiro Nato", description: "Alcance 2000 pontos no jogo de piano.", xpRequirement: 2000, icon: "images/achievements/achievement_aventureiro_nato.jpg" },
            { id: 5, name: "Lenda Viva", description: "Alcance 5000 pontos no jogo de piano.", xpRequirement: 5000, icon: "images/achievements/achievement_lenda_viva.jpg" },
            { id: 6, name: "Conquistador", description: "Alcance 10000 pontos no jogo de piano.", xpRequirement: 10000, icon: "images/achievements/achievement_conquistador.jpg" },
            { id: 7, name: "Dedicado", description: "Alcance 20000 pontos no jogo de piano.", xpRequirement: 20000, icon: "images/achievements/achievement_dedicado.jpg" },
            // Conquistas adicionais para o sistema:
            { id: 8, name: "Aluno Registrado", description: "Cadastre seu primeiro aluno.", xpRequirement: 0, isSystem: true, icon: "images/achievements/achievement_aluno_registrado.jpg" },
            { id: 9, name: "Perfil Completo", description: "Visualize seu perfil pela primeira vez.", xpRequirement: 0, isSystem: true, icon: "images/achievements/achievement_perfil_completo.jpg" },
            { id: 10, name: "Primeiro Login", description: "Acesse a aplicação pela primeira vez.", xpRequirement: 0, isSystem: true, icon: "images/achievements/achievement_primeiro_login.jpg" }
        ]),
    };

    // Salvar estado inicial se não houver dados
    if (appState.students.length === 0) {
        saveToLS('students', []);
    }
    // Os níveis e conquistas já vêm com valores padrão, então só salvamos se não existirem no LS
    if (!loadFromLS('levels', null)) {
        saveToLS('levels', appState.levels);
    }
    if (!loadFromLS('achievements', null)) {
        saveToLS('achievements', appState.achievements);
    }

    // Função para obter o nível de um aluno com base no XP
    function getLevelForXP(xp) {
        const sortedLevels = [...appState.levels].sort((a, b) => a.xp - b.xp);
        let currentLevel = sortedLevels[0]; // Nível inicial
        for (let i = 0; i < sortedLevels.length; i++) {
            if (xp >= sortedLevels[i].xp) {
                currentLevel = sortedLevels[i];
            } else {
                break;
            }
        }
        return currentLevel;
    }

   // Função para abrir modal
function openModal(modalElement) {
    if (modalElement) {
        modalElement.style.display = 'flex';
        modalElement.classList.remove('hidden');
        modalElement.classList.add('visible');
    }
}

// Função para fechar modal
function closeModal(modalElement) {
    if (modalElement) {
        modalElement.style.display = 'none';
        modalElement.classList.remove('visible');
        modalElement.classList.add('hidden');
    }
}
    // Configura a navegação para destacar a página ativa
    function setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        const currentPath = window.location.pathname.split('/').pop();

        navLinks.forEach(link => {
            link.classList.remove('active');
            // Remove o ".html" do href para comparação
            const linkHref = link.getAttribute('href').split('/').pop();

            if (linkHref === currentPath) {
                link.classList.add('active');
            } else if (currentPath === '' && linkHref === 'index.html') {
                // Caso especial para index.html quando a URL é a raiz
                link.classList.add('active');
            }
            // Manteve o texto "Dashboard" no link do index.html para refletir o seu HTML
            if (linkHref === 'index.html') {
                link.textContent = 'Dashboard';
            }
        });
    }

    // Atribuir conquista de "Primeiro Login" ao carregar qualquer página
    function assignFirstLoginAchievement() {
        let systemAchievementsStatus = loadFromLS('systemAchievementsStatus', { 'Primeiro Login': false });
        if (!systemAchievementsStatus['Primeiro Login']) {
            systemAchievementsStatus['Primeiro Login'] = true;
            saveToLS('systemAchievementsStatus', systemAchievementsStatus);
            console.log("Conquista 'Primeiro Login' atribuída.");
            // Não é associada a um aluno específico aqui, pois é uma conquista de sistema.
        }
    }

    // Adicione esta função para renderizar o ranking interativo
function renderInteractiveRanking(container, studentsToDisplay) {
    container.innerHTML = ''; // Limpa o conteúdo
    
    if (studentsToDisplay.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #888;">Nenhum ranking disponível ainda. Cadastre alunos e jogue para registrar pontuações!</p>';
        return;
    }
    
    studentsToDisplay.forEach((student, index) => {
        const levelInfo = getLevelForXP(student.totalXp);
        const nextLevel = appState.levels.find(l => l.level === levelInfo.level + 1);
        const xpForNextLevel = nextLevel ? nextLevel.xp - levelInfo.xp : 100;
        const xpProgress = nextLevel ? Math.min(100, ((student.totalXp - levelInfo.xp) / xpForNextLevel) * 100) : 100;
        
        const rankingItem = document.createElement('div');
        rankingItem.className = 'ranking-item';
        rankingItem.innerHTML = `
            <div class="rank-position">${index + 1}</div>
            <div class="student-info">
                <div class="student-name">${student.name}</div>
                <div class="student-stats">
                    <span class="student-xp">${student.totalXp} XP</span>
                    <span class="student-level" style="color: ${levelInfo.color};">${levelInfo.name}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${xpProgress}%; background: ${levelInfo.color};"></div>
                </div>
            </div>
            <div class="expand-icon">
                <span class="material-icons">expand_more</span>
            </div>
            <div class="ranking-details">
                <div class="achievement-count">
                    <strong>Conquistas:</strong> ${student.achievements.length} conquista(s)
                </div>
                <div class="achievement-badges">
                    ${student.achievements.slice(0, 5).map(achId => {
                        const achievement = appState.achievements.find(a => a.id === achId);
                        return achievement ? 
                            `<div class="achievement-badge" title="${achievement.name}">${achievement.name.charAt(0)}</div>` : 
                            '';
                    }).join('')}
                    ${student.achievements.length > 5 ? `<div class="achievement-badge">+${student.achievements.length - 5}</div>` : ''}
                </div>
                <div style="margin-top: 10px; font-size: 0.9rem;">
                    Progresso para o próximo nível: ${Math.round(xpProgress)}%
                </div>
            </div>
        `;
        
        // Adiciona o evento de clique para expandir/recolher
        rankingItem.addEventListener('click', function() {
            // Fecha outros itens abertos
            document.querySelectorAll('.ranking-item.expanded').forEach(item => {
                if (item !== this) {
                    item.classList.remove('expanded');
                }
            });
            
            // Alterna o item clicado
            this.classList.toggle('expanded');
        });
        
        container.appendChild(rankingItem);
    });
}

function initIndexPage() {
    const top5Students = [...appState.students].sort((a, b) => b.totalXp - a.totalXp).slice(0, 5);
    renderInteractiveRanking(rankingListPreview, top5Students);
    
}
    function initIndexPage() {
        const welcomeMessage = document.getElementById('welcomeMessage');
        const studentListContainer = document.getElementById('studentList');
        const rankingListPreview = document.getElementById('rankingList'); // Elemento para o ranking top 5

        // Elementos do Modal de Ranking Completo
        const rankingModal = document.getElementById('rankingModal');
        const openFullRankingModalBtn = document.getElementById('openFullRankingModal');
        const closeRankingModalBtn = document.getElementById('closeRankingModal');
        const showRankingTableBtn = document.getElementById('showRankingTableBtn');
        const showRankingCardsBtn = document.getElementById('showRankingCardsBtn');
        const expandedRankingDisplay = document.getElementById('expandedRankingDisplay');

        // Elementos do NOVO Modal de Avatar
        const avatarModal = document.getElementById('avatarModal');
        const closeAvatarModalBtn = document.getElementById('closeAvatarModal');
        const avatarForm = document.getElementById('avatarForm');
        const avatarUrlInput = document.getElementById('avatarUrl');
        const editAvatarStudentIdInput = document.getElementById('editAvatarStudentId');
        const defaultAvatar = 'images/avatars/default_avatar.jpg'; // Avatar padrão

        // Função para renderizar a lista de alunos
        function renderStudentList() {
            if (!studentListContainer) return;

            studentListContainer.innerHTML = ''; // Limpa a lista existente

            if (appState.students.length === 0) {
                studentListContainer.innerHTML = '<p style="text-align: center; color: #888;">Nenhum aluno cadastrado ainda. Vá para o painel de administração para adicionar um.</p>';
                return;
            }

            // Ordena os alunos por XP em ordem decrescente
            const sortedStudents = [...appState.students].sort((a, b) => b.totalXp - a.totalXp);

            sortedStudents.forEach(student => {
                const levelInfo = getLevelForXP(student.totalXp);
                const studentDiv = document.createElement('div');
                studentDiv.className = 'student-item'; // Pode adicionar uma classe para estilização individual se quiser
                studentDiv.innerHTML = `
                    <span>${student.name}</span>
                    <span>${student.totalXp}</span>
                    <span style="color: ${levelInfo.color}; font-weight: bold;">${levelInfo.name}</span>
                    <span class="avatar-action">
                        <img src="${student.avatar || defaultAvatar}" alt="Avatar" style="width: 30px; height: 30px; border-radius: 50%; vertical-align: middle; margin-right: 5px;">
                        <button class="btn-icon edit-avatar-btn" data-student-id="${student.id}" title="Editar Avatar">
                            <span class="material-icons">edit</span>
                        </button>
                    </span>
                `;
                studentListContainer.appendChild(studentDiv);
            });

            // Adiciona listeners para os botões de editar avatar APÓS a renderização
            document.querySelectorAll('.edit-avatar-btn').forEach(button => {
                button.addEventListener('click', (event) => {
                    const studentId = event.currentTarget.dataset.studentId;
                    const studentToEdit = appState.students.find(s => s.id === studentId);
                    if (studentToEdit) {
                        avatarUrlInput.value = studentToEdit.avatar || ''; // Preenche com URL existente
                        editAvatarStudentIdInput.value = studentId; // Define o ID do aluno no campo oculto
                        openModal(avatarModal);
                    }
                });
            });
        }

        // Função para renderizar o ranking (preview ou completo em tabela)
        function renderRankingTable(container, studentsToDisplay, isFullRanking = false) {
            container.innerHTML = ''; // Limpa o conteúdo

            if (studentsToDisplay.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: #888;">Nenhum ranking disponível ainda. Cadastre alunos e jogue para registrar pontuações!</p>';
                return;
            }

            // Adiciona cabeçalho da lista
            const header = document.createElement('div');
            header.className = 'ranking-list-header'; // Reutiliza a classe de cabeçalho
            header.innerHTML = `
                <span>#</span>
                <span>Nome</span>
                <span>XP Total</span>
                <span>Nível</span>
            `;
            container.appendChild(header);

            studentsToDisplay.forEach((student, index) => {
                const levelInfo = getLevelForXP(student.totalXp);
                const rankingItem = document.createElement('div');
                rankingItem.className = 'ranking-item'; // Pode adicionar uma classe para estilização individual
                rankingItem.innerHTML = `
                    <span>${index + 1}</span>
                    <span>${student.name}</span>
                    <span>${student.totalXp}</span>
                    <span style="color: ${levelInfo.color}; font-weight: bold;">${levelInfo.name}</span>
                `;
                container.appendChild(rankingItem);
            });
        }

        // Função para renderizar o ranking em cards
        function renderRankingCards(container, studentsToDisplay) {
            container.innerHTML = ''; // Limpa o conteúdo
            container.classList.add('ranking-cards-grid'); // Aplica o grid CSS

            if (studentsToDisplay.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: #888;">Nenhum ranking disponível ainda.</p>';
                container.classList.remove('ranking-cards-grid');
                return;
            }

            studentsToDisplay.forEach((student, index) => {
                const levelInfo = getLevelForXP(student.totalXp);
                const studentCard = document.createElement('div');
                studentCard.className = 'ranking-card';
                studentCard.innerHTML = `
                    <div class="rank-number">${index + 1}</div>
                    <img src="${student.avatar || defaultAvatar}" alt="Avatar" class="profile-avatar" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 2px solid ${levelInfo.color};">
                    <div class="player-name">${student.name}</div>
                    <div class="player-xp">${student.totalXp} XP</div>
                    <div class="player-level" style="color: ${levelInfo.color};">${levelInfo.name}</div>
                    <div class="player-achievements">
                        ${student.achievements.slice(0, 3).map(achId => { // Mostra até 3 conquistas no card
                            const achievement = appState.achievements.find(a => a.id === achId);
                            return achievement ? `<img src="${achievement.icon || 'images/achievements/default.jpg'}" title="${achievement.name}">` : '';
                        }).join('')}
                    </div>
                `;
                container.appendChild(studentCard);
            });
        }

        // Função para renderizar a tabela de níveis (do seu index.html original)
        function renderLevelsTable() {
            const levelsTableContainer = document.getElementById('levelsTable');
            if (!levelsTableContainer) return;

            levelsTableContainer.innerHTML = ''; // Limpa

            appState.levels.forEach(level => {
                const levelItem = document.createElement('div');
                levelItem.className = 'item-nivel'; // Classe do seu HTML original
                levelItem.innerHTML = `
                    <span class="nome-nivel">${level.name}</span>
                    <span class="faixa-nivel">${level.xp} XP${appState.levels.indexOf(level) < appState.levels.length - 1 ? ' - ' + (appState.levels[appState.levels.indexOf(level) + 1].xp - 1) + ' XP' : '+' }</span>
                    <span class="cor-nivel" style="background-color: ${level.color};"></span>
                `;
                levelsTableContainer.appendChild(levelItem);
            });
        }

        // Atualiza mensagem de boas-vindas
        if (welcomeMessage) {
            welcomeMessage.textContent = `Bem-vindo, Professor!`;
        }

        // Inicializa a exibição de alunos e ranking
        renderStudentList();
        const top5Students = [...appState.students].sort((a, b) => b.totalXp - a.totalXp).slice(0, 5);
        renderRankingTable(rankingListPreview, top5Students); // Renderiza o preview do ranking
        renderLevelsTable(); // Renderiza a tabela de níveis

        // Event Listeners para o Modal de Ranking Completo
        if (openFullRankingModalBtn) {
            openFullRankingModalBtn.addEventListener('click', () => {
                openModal(rankingModal);
                // Por padrão, mostra a tabela ao abrir o modal
                showRankingTableBtn.classList.add('active');
                showRankingCardsBtn.classList.remove('active');
                renderRankingTable(expandedRankingDisplay, [...appState.students].sort((a, b) => b.totalXp - a.totalXp), true);
            });
        }
        if (closeRankingModalBtn) {
            closeRankingModalBtn.addEventListener('click', () => closeModal(rankingModal));
        }

        if (showRankingTableBtn) {
            showRankingTableBtn.addEventListener('click', () => {
                showRankingTableBtn.classList.add('active');
                showRankingCardsBtn.classList.remove('active');
                renderRankingTable(expandedRankingDisplay, [...appState.students].sort((a, b) => b.totalXp - a.totalXp), true);
            });
        }
        if (showRankingCardsBtn) {
            showRankingCardsBtn.addEventListener('click', () => {
                showRankingCardsBtn.classList.add('active');
                showRankingTableBtn.classList.remove('active');
                renderRankingCards(expandedRankingDisplay, [...appState.students].sort((a, b) => b.totalXp - a.totalXp));
            });
        }

        // Event Listeners para o NOVO Modal de Avatar
        if (closeAvatarModalBtn) {
            closeAvatarModalBtn.addEventListener('click', () => closeModal(avatarModal));
        }
        if (avatarForm) {
            avatarForm.addEventListener('submit', (event) => {
                event.preventDefault();
                const studentId = editAvatarStudentIdInput.value;
                const newAvatarUrl = avatarUrlInput.value.trim();

                const studentIndex = appState.students.findIndex(s => s.id === studentId);
                if (studentIndex !== -1) {
                    appState.students[studentIndex].avatar = newAvatarUrl;
                    saveToLS('students', appState.students);
                    alert('Avatar atualizado com sucesso!');
                    closeModal(avatarModal);
                    renderStudentList(); // Re-renderiza a lista para mostrar o novo avatar
                } else {
                    alert('Erro: Aluno não encontrado.');
                }
            });
        }
        
    }
    // #endregion
    // ===============================================================================================================


    // #region Lógica para a Página de Perfis (profiles.html)
    // ===============================================================================================================
    function initProfilesPage() {
        const studentSelect = document.getElementById('studentSelect');
        const profileDisplay = document.getElementById('profileDisplay');
        const defaultAvatar = 'images/avatars/default_avatar.jpg'; // Avatar padrão

        function populateStudentSelect() {
            if (!studentSelect) return;
            studentSelect.innerHTML = '<option value="">Selecione um aluno</option>';
            appState.students.forEach(student => {
                const option = document.createElement('option');
                option.value = student.id;
                option.textContent = student.name;
                studentSelect.appendChild(option);
            });
        }

        function renderProfile(studentId) {
            if (!profileDisplay) return;

            const student = appState.students.find(s => s.id === studentId);

            if (!student) {
                profileDisplay.innerHTML = '<p class="text-center text-gray-500">Selecione um aluno para ver o perfil.</p>';
                return;
            }

            const levelInfo = getLevelForXP(student.totalXp);
            // Filtra conquistas para não incluir as de sistema na exibição principal, a menos que o xpRequirement seja > 0
            const displayAchievements = appState.achievements.filter(ach => !ach.isSystem || ach.xpRequirement > 0);

            const earnedAchievements = displayAchievements.filter(ach => student.achievements.includes(ach.id));
            const unearnedAchievements = displayAchievements.filter(ach => !student.achievements.includes(ach.id));

            profileDisplay.innerHTML = `
                <div class="profile-header">
                    <img src="${student.avatar || defaultAvatar}" alt="Avatar do Aluno" class="profile-avatar">
                    <h2 class="profile-name">${student.name}</h2>
                    <p class="profile-xp-level">XP: ${student.totalXp} | Nível: ${levelInfo.name}</p>
                    <div class="level-bar-container" style="background-color: #e0e0e0; border-radius: 5px; height: 15px; margin: 10px auto; width: 80%; max-width: 300px;">
                        <div class="level-bar-fill" style="background-color: ${levelInfo.color}; height: 100%; width: ${((student.totalXp - levelInfo.xp) / ((appState.levels[appState.levels.indexOf(levelInfo) + 1]?.xp || student.totalXp + 100) - levelInfo.xp)) * 100}%; border-radius: 5px;"></div>
                    </div>
                </div>

                <div class="card">
                    <h3 class="profile-section-title">Conquistas Ganhas</h3>
                    <div class="achievements-grid">
                        ${earnedAchievements.map(ach => `
                            <div class="achievement-card earned">
                                <img src="${ach.icon || 'images/achievements/default.jpg'}" alt="${ach.name}">
                                <h3>${ach.name}</h3>
                                <p>${ach.description}</p>
                            </div>
                        `).join('')}
                    </div>
                    ${earnedAchievements.length === 0 ? '<p class="text-center text-gray-500 mt-4">Nenhuma conquista ganha ainda.</p>' : ''}
                </div>

                <div class="card">
                    <h3 class="profile-section-title">Conquistas a Desbloquear</h3>
                    <div class="achievements-grid">
                        ${unearnedAchievements.map(ach => `
                            <div class="achievement-card">
                                <img src="${ach.icon || 'images/achievements/default.jpg'}" alt="${ach.name}" class="achievement-locked">
                                <h3>${ach.name}</h3>
                                <p>${ach.description}</p>
                            </div>
                        `).join('')}
                    </div>
                    ${unearnedAchievements.length === 0 ? '<p class="text-center text-gray-500 mt-4">Todas as conquistas desbloqueadas!</p>' : ''}
                </div>
            `;

            // Atribuir conquista "Perfil Completo" ao ver o perfil
            let systemAchievementsStatus = loadFromLS('systemAchievementsStatus', { 'Perfil Completo': false });
            const profileAch = appState.achievements.find(a => a.name === "Perfil Completo");

            if (profileAch && !systemAchievementsStatus['Perfil Completo']) {
                if (student && !student.achievements.includes(profileAch.id)) {
                    student.achievements.push(profileAch.id);
                    saveToLS('students', appState.students);
                }
                systemAchievementsStatus['Perfil Completo'] = true;
                saveToLS('systemAchievementsStatus', systemAchievementsStatus);
                console.log("Conquista 'Perfil Completo' atribuída.");
            }
        }

        populateStudentSelect();
        studentSelect.addEventListener('change', (event) => {
            renderProfile(event.target.value);
        });

        // Tenta carregar o perfil do primeiro aluno se houver
        if (appState.students.length > 0) {
            studentSelect.value = appState.students[0].id;
            renderProfile(appState.students[0].id);
        }
    }
    // #endregion
    // ===============================================================================================================


    // #region Lógica para a Página do Jogo (games.html)
    // ===============================================================================================================
    function initGamesPage() {
        // Estado do jogo (específico para a página de jogos)
        const gameState = {
            isPlaying: false,
            timer: 60,
            score: 0,
            currentNote: null,
            timerInterval: null,
            highlightedKey: null,
            playerName: '',
            playedNotes: [],
            currentPointsPerCorrect: 100,
            selectedStudentId: null
        };

        // Configuração das notas do piano
        const notes = [
            { name: 'Dó', id: 'do', isBlack: false },
            { name: 'Dó♯', id: 'do#', isBlack: true },
            { name: 'Ré', id: 're', isBlack: false },
            { name: 'Ré♯', id: 're#', isBlack: true },
            { name: 'Mi', id: 'mi', isBlack: false },
            { name: 'Fá', id: 'fa', isBlack: false },
            { name: 'Fá♯', id: 'fa#', isBlack: true },
            { name: 'Sol', id: 'sol', isBlack: false },
            { name: 'Sol♯', id: 'sol#', isBlack: true },
            { name: 'Lá', id: 'la', isBlack: false },
            { name: 'Lá♯', id: 'la#', isBlack: true },
            { name: 'Si', id: 'si', isBlack: false }
        ];

        // Elementos do DOM (específicos para games.html)
        const elements = {
            playerNameInput: document.getElementById('playerName'),
            startGameBtn: document.getElementById('startGame'),
            timerDisplay: document.getElementById('timer'),
            scoreDisplay: document.getElementById('score'),
            currentNoteDisplay: document.getElementById('currentNote'),
            pianoKeyboard: document.querySelector('.piano-keyboard'),
            noteButtonsGrid: document.querySelector('#noteButtons'),
            gameOverModal: document.getElementById('gameOverModal'),
            finalScoreDisplay: document.getElementById('finalScore'),
            finalTimeDisplay: document.getElementById('finalTime'),
            finalPlayerNameDisplay: document.getElementById('finalPlayerName'),
            playAgainBtn: document.getElementById('playAgain'),
            // Ranking no jogo (usará o mesmo modal de ranking da index.html se for global)
            // Para simplicidade, o modal de ranking será aberto através do botão de "Ver Ranking do Modal de Fim de Jogo"
            rankingModal: document.getElementById('rankingModal'), // Reutiliza o modal de ranking global
            closeRankingBtn: document.getElementById('closeRankingModal'), // Reutiliza o botão de fechar do modal global
            viewRankingFromModalBtn: document.getElementById('viewRankingFromModal'),
            backToStartBtn: document.getElementById('backToStart'),
            studentSelectGame: document.getElementById('studentSelectGame')
        };

        const defaultAvatar = 'images/avatars/default_avatar.jpg';

        // #region Funções do Jogo
        // -----------------------------------------------------------------------------------------------------------

        function populateStudentSelectGame() {
            if (!elements.studentSelectGame) return;
            elements.studentSelectGame.innerHTML = '<option value="">Selecionar Aluno</option>';
            appState.students.forEach(student => {
                const option = document.createElement('option');
                option.value = student.id;
                option.textContent = student.name;
                elements.studentSelectGame.appendChild(option);
            });
            // Tenta pré-selecionar o primeiro aluno se houver
            if (appState.students.length > 0) {
                elements.studentSelectGame.value = appState.students[0].id;
                gameState.selectedStudentId = appState.students[0].id;
                elements.playerNameInput.value = appState.students[0].name;
                elements.playerNameInput.setAttribute('readonly', 'true');
            } else {
                elements.playerNameInput.value = '';
                elements.playerNameInput.removeAttribute('readonly');
            }
        }

        function setupGameEventListeners() {
            if (elements.startGameBtn) {
                elements.startGameBtn.addEventListener('click', startGame);
            }
            if (elements.playAgainBtn) {
                elements.playAgainBtn.addEventListener('click', resetGame);
            }
            if (elements.closeRankingBtn) {
                // Certifica-se de que o botão de fechar no modal de ranking funcione para games.html também
                elements.closeRankingBtn.addEventListener('click', () => closeModal(elements.rankingModal));
            }
            if (elements.viewRankingFromModalBtn) {
                elements.viewRankingFromModalBtn.addEventListener('click', () => {
                    closeModal(elements.gameOverModal);
                    showRankingGame(); // Função para mostrar o ranking no contexto do jogo
                });
            }
            if (elements.backToStartBtn) {
                elements.backToStartBtn.addEventListener('click', backToStart);
            }

            if (elements.pianoKeyboard) {
                document.querySelectorAll('.white-key, .black-key').forEach(key => {
                    key.addEventListener('click', () => {
                        if (!gameState.isPlaying) return;
                        const noteName = key.dataset.note;
                        checkAnswer(noteName);
                    });
                });
            }

            if (elements.studentSelectGame) {
                elements.studentSelectGame.addEventListener('change', (event) => {
                    const studentId = event.target.value;
                    if (studentId) {
                        const selectedStudent = appState.students.find(s => s.id === studentId);
                        if (selectedStudent) {
                            gameState.selectedStudentId = studentId;
                            elements.playerNameInput.value = selectedStudent.name;
                            elements.playerNameInput.setAttribute('readonly', 'true');
                        }
                    } else {
                        gameState.selectedStudentId = null;
                        elements.playerNameInput.value = '';
                        elements.playerNameInput.removeAttribute('readonly');
                    }
                });
            }
        }

        function createNoteButtons() {
            if (!elements.noteButtonsGrid) return;
            elements.noteButtonsGrid.innerHTML = '';

            const allNotes = [...notes];
            let notesForButtons = [...allNotes].sort(() => Math.random() - 0.5).slice(0, 8);

            if (gameState.isPlaying && gameState.currentNote && !notesForButtons.some(n => n.name === gameState.currentNote)) {
                const noteToReplaceIndex = Math.floor(Math.random() * notesForButtons.length);
                notesForButtons[noteToReplaceIndex] = allNotes.find(n => n.name === gameState.currentNote);
            }

            const remainingNotes = allNotes.filter(n => !notesForButtons.includes(n));
            notesForButtons = notesForButtons.concat(remainingNotes.slice(0, 12 - notesForButtons.length));

            notesForButtons.sort(() => Math.random() - 0.5);

            notesForButtons.forEach(note => {
                const button = document.createElement('button');
                // Mantendo as classes originais do seu game.html, removendo as classes TailwindCSS
                button.className = `note-button`;
                button.textContent = note.name;
                button.dataset.note = note.name;

                button.addEventListener('click', () => checkAnswer(note.name));

                elements.noteButtonsGrid.appendChild(button);
            });
        }

        function startGame() {
            const playerName = elements.playerNameInput.value.trim();
            if (!playerName) {
                alert('Por favor, digite seu nome ou selecione um aluno para começar!');
                return;
            }

            if (!gameState.selectedStudentId && appState.students.length > 0) {
                 alert('Por favor, selecione um aluno na lista suspensa para registrar sua pontuação!');
                 return;
            }

            if (elements.currentNoteDisplay) {
                elements.currentNoteDisplay.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }

            gameState.playerName = playerName;
            gameState.isPlaying = true;
            gameState.timer = 60;
            gameState.score = 0;
            gameState.currentPointsPerCorrect = 100;
            gameState.playedNotes = [];
            gameState.highlightedKey = null;

            document.querySelectorAll('.white-key, .black-key').forEach(key => {
                const label = key.querySelector('.key-label');
                if (label) {
                    key.removeChild(label);
                }
                key.classList.remove('pulse-animation', 'flash-red', 'flash-green', 'fast-flash-green');
                key.style.border = '';
            });

            elements.timerDisplay.textContent = Math.floor(gameState.timer);
            elements.scoreDisplay.textContent = gameState.score;
            elements.currentNoteDisplay.textContent = '?';

            elements.playerNameInput.disabled = true;
            if (elements.studentSelectGame) {
                elements.studentSelectGame.disabled = true;
            }
            elements.startGameBtn.disabled = true;


            gameState.timerInterval = setInterval(() => {
                gameState.timer--;
                elements.timerDisplay.textContent = Math.floor(gameState.timer);

                if (gameState.timer <= 0) {
                    endGame();
                }
            }, 1000);

            nextRound();
        }

        function nextRound() {
            if (gameState.highlightedKey) {
                const prevKey = document.getElementById(gameState.highlightedKey.id);
                if (prevKey) {
                    prevKey.classList.remove('pulse-animation');
                    prevKey.style.border = '';
                }
            }

            if (gameState.playedNotes.length === notes.length) {
                gameState.playedNotes = [];
                gameState.currentPointsPerCorrect += 50;
                document.querySelectorAll('.white-key, .black-key').forEach(key => {
                    const label = key.querySelector('.key-label');
                    if (label) {
                        key.removeChild(label);
                    }
                });
            }

            const availableNotes = notes.filter(note => !gameState.playedNotes.includes(note.name));
            const randomIndex = Math.floor(Math.random() * availableNotes.length);
            const randomNote = availableNotes[randomIndex];
            gameState.currentNote = randomNote.name;
            gameState.highlightedKey = randomNote;
            gameState.playedNotes.push(randomNote.name);

            elements.currentNoteDisplay.textContent = '?';

            const keyElement = document.getElementById(randomNote.id);
            if (keyElement) {
                keyElement.classList.add('pulse-animation');
                keyElement.style.border = '2px solid var(--primary-color)';
            }

            createNoteButtons();
        }

        function checkAnswer(selectedNote) {
            if (!gameState.isPlaying) return;

            const keyElement = document.getElementById(gameState.highlightedKey.id);

            if (selectedNote === gameState.currentNote) {
                gameState.score += gameState.currentPointsPerCorrect;
                gameState.timer += 1.3;
                elements.scoreDisplay.textContent = gameState.score;
                elements.timerDisplay.textContent = Math.floor(gameState.timer);

                keyElement.classList.remove('pulse-animation');
                keyElement.classList.add('fast-flash-green');
                if (keyElement && !keyElement.querySelector('.key-label')) {
                    const label = document.createElement('div');
                    label.className = 'key-label';
                    label.textContent = gameState.currentNote;
                    keyElement.appendChild(label);
                }

                setTimeout(() => {
                    keyElement.classList.remove('fast-flash-green');
                    keyElement.style.border = '';
                }, 400);

                setTimeout(() => {
                    nextRound();
                }, 200);
            } else {
                keyElement.classList.remove('pulse-animation');
                keyElement.classList.add('flash-red');

                setTimeout(() => {
                    keyElement.classList.remove('flash-red');
                    keyElement.style.border = '2px solid var(--primary-color)';
                    keyElement.classList.add('pulse-animation');
                }, 500);
            }
        }

        function getEarnedAchievementsForScore(score) {
            const earned = [];
            appState.achievements.forEach(achievement => {
                if (!achievement.isSystem && achievement.xpRequirement > 0 && score >= achievement.xpRequirement) {
                    earned.push(achievement.id);
                }
            });
            return earned;
        }

        function endGame() {
            gameState.isPlaying = false;
            clearInterval(gameState.timerInterval);

            if (gameState.highlightedKey) {
                const keyElement = document.getElementById(gameState.highlightedKey.id);
                if (keyElement) {
                    keyElement.classList.remove('pulse-animation');
                    keyElement.style.border = '';
                }
            }

            elements.playerNameInput.disabled = false;
            if (elements.studentSelectGame) {
                elements.studentSelectGame.disabled = false;
            }
            elements.startGameBtn.disabled = false;

            const finalTimePlayed = 60 - gameState.timer;

            elements.finalScoreDisplay.textContent = gameState.score;
            elements.finalTimeDisplay.textContent = finalTimePlayed;
            elements.finalPlayerNameDisplay.textContent = gameState.playerName;

            if (gameState.selectedStudentId) {
                const studentIndex = appState.students.findIndex(s => s.id === gameState.selectedStudentId);
                if (studentIndex !== -1) {
                    const student = appState.students[studentIndex];
                    student.totalXp += gameState.score;

                    const achievementsEarnedThisGame = getEarnedAchievementsForScore(gameState.score);

                    achievementsEarnedThisGame.forEach(achId => {
                        if (!student.achievements.includes(achId)) {
                            student.achievements.push(achId);
                        }
                    });

                    saveToLS('students', appState.students);
                }
            }

            openModal(elements.gameOverModal);
        }

        function resetGame() {
            closeModal(elements.gameOverModal);
            elements.currentNoteDisplay.textContent = '?';

            document.querySelectorAll('.white-key, .black-key').forEach(key => {
                const label = key.querySelector('.key-label');
                if (label) {
                    key.removeChild(label);
                }
            });

            startGame();
        }

        function backToStart() {
            closeModal(elements.gameOverModal);
            elements.currentNoteDisplay.textContent = '?';
            gameState.isPlaying = false;
            clearInterval(gameState.timerInterval);
            if (gameState.highlightedKey) {
                const keyElement = document.getElementById(gameState.highlightedKey.id);
                if (keyElement) {
                    keyElement.classList.remove('pulse-animation');
                    keyElement.style.border = '';
                }
            }
            populateStudentSelectGame();
            elements.playerNameInput.disabled = false;
            elements.startGameBtn.disabled = false;
        }

        // Função para mostrar o ranking no contexto do jogo (reutilizando o modal global)
        function showRankingGame() {
            openModal(elements.rankingModal);
            const allStudentsSorted = [...appState.students].sort((a, b) => b.totalXp - a.totalXp);
            const rankingList = elements.rankingModal.querySelector('#rankingList'); // Assume que há um #rankingList dentro do modal
            const rankingCardsGrid = elements.rankingModal.querySelector('#rankingCardsGrid'); // Assume um #rankingCardsGrid
            const showTableBtn = elements.rankingModal.querySelector('#showRankingTableBtn'); // Botões do modal global
            const showCardsBtn = elements.rankingModal.querySelector('#showRankingCardsBtn');

            // Garante que o container correto esteja visível e o outro escondido
            if (rankingList) rankingList.style.display = 'block';
            if (rankingCardsGrid) rankingCardsGrid.style.display = 'none';

            // Garante que o botão 'Tabela' esteja ativo por padrão
            if (showTableBtn) showTableBtn.classList.add('active');
            if (showCardsBtn) showCardsBtn.classList.remove('active');

            // Renderiza o ranking em formato de tabela
            if (rankingList) {
                rankingList.innerHTML = ''; // Limpa o conteúdo
                if (allStudentsSorted.length === 0) {
                    rankingList.innerHTML = '<p class="text-center text-gray-500">Nenhum ranking disponível ainda. Jogue para registrar sua pontuação!</p>';
                } else {
                    const header = document.createElement('div');
                    header.className = 'ranking-list-header';
                    header.innerHTML = `
                        <span>#</span>
                        <span>Nome</span>
                        <span>Pontuação</span>
                    `;
                    rankingList.appendChild(header);

                    allStudentsSorted.slice(0, 10).forEach((entry, index) => {
                        const rankingItem = document.createElement('div');
                        rankingItem.innerHTML = `
                            <span>${index + 1}</span>
                            <span>${entry.name}</span>
                            <span>${entry.totalXp} XP</span>
                        `;
                        rankingList.appendChild(rankingItem);
                    });
                }
            }

             // Adiciona listeners para alternar entre tabela e cards dentro do modal de ranking
            if (showTableBtn && showCardsBtn && rankingList && rankingCardsGrid) {
                // Remove listeners antigos para evitar duplicação se initGamesPage for chamada várias vezes
                const oldShowTableBtn = showTableBtn.cloneNode(true);
                showTableBtn.parentNode.replaceChild(oldShowTableBtn, showTableBtn);
                showTableBtn = oldShowTableBtn;

                const oldShowCardsBtn = showCardsBtn.cloneNode(true);
                showCardsBtn.parentNode.replaceChild(oldShowCardsBtn, showCardsBtn);
                showCardsBtn = oldShowCardsBtn;

                showTableBtn.addEventListener('click', () => {
                    showTableBtn.classList.add('active');
                    showCardsBtn.classList.remove('active');
                    rankingList.style.display = 'block';
                    rankingCardsGrid.style.display = 'none';
                    // Re-renderiza a tabela
                    rankingList.innerHTML = '';
                    if (allStudentsSorted.length === 0) {
                        rankingList.innerHTML = '<p class="text-center text-gray-500">Nenhum ranking disponível ainda. Jogue para registrar sua pontuação!</p>';
                    } else {
                        const header = document.createElement('div');
                        header.className = 'ranking-list-header';
                        header.innerHTML = `
                            <span>#</span>
                            <span>Nome</span>
                            <span>Pontuação</span>
                        `;
                        rankingList.appendChild(header);

                        allStudentsSorted.forEach((entry, index) => {
                            const rankingItem = document.createElement('div');
                            rankingItem.innerHTML = `
                                <span>${index + 1}</span>
                                <span>${entry.name}</span>
                                <span>${entry.totalXp} XP</span>
                            `;
                            rankingList.appendChild(rankingItem);
                        });
                    }
                });

                showCardsBtn.addEventListener('click', () => {
                    showCardsBtn.classList.add('active');
                    showTableBtn.classList.remove('active');
                    rankingList.style.display = 'none';
                    rankingCardsGrid.style.display = 'grid'; // Ou 'flex', dependendo do seu CSS
                    // Re-renderiza os cards
                    rankingCardsGrid.innerHTML = '';
                    if (allStudentsSorted.length === 0) {
                        rankingCardsGrid.innerHTML = '<p class="text-center text-gray-500">Nenhum ranking disponível ainda.</p>';
                    } else {
                        allStudentsSorted.forEach((student, index) => {
                            const levelInfo = getLevelForXP(student.totalXp);
                            const studentCard = document.createElement('div');
                            studentCard.className = 'ranking-card';
                            studentCard.innerHTML = `
                                <div class="rank-number">${index + 1}</div>
                                <img src="${student.avatar || defaultAvatar}" alt="Avatar" class="profile-avatar" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 2px solid ${levelInfo.color};">
                                <div class="player-name">${student.name}</div>
                                <div class="player-xp">${student.totalXp} XP</div>
                                <div class="player-level" style="color: ${levelInfo.color};">${levelInfo.name}</div>
                            `;
                            rankingCardsGrid.appendChild(studentCard);
                        });
                    }
                });
            }
        }
        // -----------------------------------------------------------------------------------------------------------
        // #endregion

        // Inicialização específica da página de jogos
        populateStudentSelectGame();
        setupGameEventListeners();
        createNoteButtons();
    }
    // #endregion
   function initAdminPage() {
    // Elementos do DOM para gerenciamento de alunos
    const addStudentModal = document.getElementById('addStudentModal');
    const openAddStudentModalBtn = document.getElementById('openAddStudentModal');
    const closeAddStudentModalBtn = document.getElementById('closeAddStudentModal');
    const addStudentForm = document.getElementById('addStudentForm');
    const studentNameInput = document.getElementById('studentName');
    const studentXPInput = document.getElementById('studentXP');
    const studentAvatarInput = document.getElementById('studentAvatar');

    // Elementos dos novos modais
    const levelsModal = document.getElementById('levelsModal');
    const achievementsModal = document.getElementById('achievementsModal');
    const statsModal = document.getElementById('statsModal');
    
    // Botões para abrir os modais
    const openLevelsModalBtn = document.getElementById('openLevelsModal');
    const openAchievementsModalBtn = document.getElementById('openAchievementsModal');
    const openStatsModalBtn = document.getElementById('openStatsModal');
    
    // Botões para fechar os modais
    const closeLevelsModalBtn = document.getElementById('closeLevelsModal');
    const closeAchievementsModalBtn = document.getElementById('closeAchievementsModal');
    const closeStatsModalBtn = document.getElementById('closeStatsModal');
    
    // ========== GERENCIAMENTO DE ALUNOS ==========
    // Adicionar eventos para o modal de cadastro de aluno
    if (openAddStudentModalBtn && addStudentModal) {
        openAddStudentModalBtn.addEventListener('click', () => openModal(addStudentModal));
    }
    
    if (closeAddStudentModalBtn && addStudentModal) {
        closeAddStudentModalBtn.addEventListener('click', () => closeModal(addStudentModal));
    }

    if (addStudentForm) {
        addStudentForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Evita o recarregamento da página

            const studentName = studentNameInput.value.trim();
            const studentXP = parseInt(studentXPInput.value, 10);
            const studentAvatar = studentAvatarInput.value.trim();

            if (!studentName) {
                alert('Por favor, digite o nome do aluno.');
                return;
            }
            if (isNaN(studentXP) || studentXP < 0) {
                alert('Pontos de XP iniciais inválidos.');
                return;
            }

            // Verifica se já existe um aluno com o mesmo nome (case-insensitive)
            const studentExists = appState.students.some(s => s.name.toLowerCase() === studentName.toLowerCase());
            if (studentExists) {
                alert('Um aluno com este nome já existe. Por favor, escolha um nome diferente.');
                return;
            }

            // Cria um ID único para o aluno (simples para este exemplo)
            const newStudentId = 'student_' + Date.now();

            const newStudent = {
                id: newStudentId,
                name: studentName,
                totalXp: studentXP,
                avatar: studentAvatar || 'images/avatars/default_avatar.jpg',
                achievements: []
            };

            appState.students.push(newStudent);
            saveToLS('students', appState.students);

            alert(`Aluno "${newStudent.name}" cadastrado com sucesso!`);
            addStudentForm.reset(); // Limpa o formulário
            closeModal(addStudentModal);

            // Atribui a conquista "Aluno Registrado"
            let systemAchievementsStatus = loadFromLS('systemAchievementsStatus', { 'Aluno Registrado': false });
            const registeredAch = appState.achievements.find(a => a.name === "Aluno Registrado");

            if (registeredAch && !systemAchievementsStatus['Aluno Registrado']) {
                systemAchievementsStatus['Aluno Registrado'] = true;
                saveToLS('systemAchievementsStatus', systemAchievementsStatus);

                // Adiciona a conquista ao aluno recém-criado
                if (!newStudent.achievements.includes(registeredAch.id)) {
                    newStudent.achievements.push(registeredAch.id);
                    saveToLS('students', appState.students);
                }
                console.log("Conquista 'Aluno Registrado' atribuída ao novo aluno.");
            }
        });
    }
    
    // ========== GERENCIAMENTO DE NÍVEIS ==========
    // Adicionar eventos para abrir os modais
    if (openLevelsModalBtn && levelsModal) {
        openLevelsModalBtn.addEventListener('click', () => {
            openModal(levelsModal);
            renderLevelsTable();
        });
    }
    
    if (openAchievementsModalBtn && achievementsModal) {
        openAchievementsModalBtn.addEventListener('click', () => {
            openModal(achievementsModal);
            renderAchievementsTable();
        });
    }
    
    if (openStatsModalBtn && statsModal) {
        openStatsModalBtn.addEventListener('click', () => {
            openModal(statsModal);
            renderStats();
        });
    }
    
    // Adicionar eventos para fechar os modais
    if (closeLevelsModalBtn && levelsModal) {
        closeLevelsModalBtn.addEventListener('click', () => closeModal(levelsModal));
    }
    
    if (closeAchievementsModalBtn && achievementsModal) {
        closeAchievementsModalBtn.addEventListener('click', () => closeModal(achievementsModal));
    }
    
    if (closeStatsModalBtn && statsModal) {
        closeStatsModalBtn.addEventListener('click', () => closeModal(statsModal));
    }
    
    // Fechar modais clicando fora deles
    window.addEventListener('click', (event) => {
        if (event.target === addStudentModal) closeModal(addStudentModal);
        if (event.target === levelsModal) closeModal(levelsModal);
        if (event.target === achievementsModal) closeModal(achievementsModal);
        if (event.target === statsModal) closeModal(statsModal);
    });
    
    // Função para renderizar a tabela de níveis no modal
    function renderLevelsTable() {
        const levelsTableBody = document.getElementById('levelsTableBody');
        if (!levelsTableBody) return;
        
        levelsTableBody.innerHTML = '';
        
        appState.levels.forEach(level => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${level.level}</td>
                <td><input type="number" value="${level.xp}" class="level-xp-input" data-level="${level.level}"></td>
                <td><input type="color" value="${level.color}" class="level-color-input" data-level="${level.level}"></td>
                <td>
                    <button class="btn btn-primary save-level-btn" data-level="${level.level}">Salvar</button>
                </td>
            `;
            levelsTableBody.appendChild(row);
        });
        
        // Adicionar eventos para os botões de salvar
        document.querySelectorAll('.save-level-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const level = parseInt(e.target.dataset.level);
                const xpInput = document.querySelector(`.level-xp-input[data-level="${level}"]`);
                const colorInput = document.querySelector(`.level-color-input[data-level="${level}"]`);
                
                if (xpInput && colorInput) {
                    const newXp = parseInt(xpInput.value);
                    const newColor = colorInput.value;
                    
                    // Atualizar o nível no estado da aplicação
                    const levelIndex = appState.levels.findIndex(l => l.level === level);
                    if (levelIndex !== -1) {
                        appState.levels[levelIndex].xp = newXp;
                        appState.levels[levelIndex].color = newColor;
                        saveToLS('levels', appState.levels);
                        alert(`Nível ${level} atualizado com sucesso!`);
                    }
                }
            });
        });
    }
    
    // Função para renderizar a tabela de conquistas
    function renderAchievementsTable() {
        const achievementsTableBody = document.getElementById('achievementsTableBody');
        if (!achievementsTableBody) return;
        
        achievementsTableBody.innerHTML = '';
        
        appState.achievements.forEach(achievement => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${achievement.name}</td>
                <td>${achievement.description}</td>
                <td>${achievement.xpRequirement}</td>
                <td>
                    <button class="btn btn-primary edit-achievement-btn" data-id="${achievement.id}">Editar</button>
                    <button class="btn btn-danger delete-achievement-btn" data-id="${achievement.id}">Excluir</button>
                </td>
            `;
            achievementsTableBody.appendChild(row);
        });
        
        // Adicionar eventos para os botões de editar e excluir
        document.querySelectorAll('.edit-achievement-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const achievementId = parseInt(e.target.dataset.id);
                // Implementar lógica de edição aqui
                alert(`Editar conquista ${achievementId} - Funcionalidade em desenvolvimento`);
            });
        });
        
        document.querySelectorAll('.delete-achievement-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const achievementId = parseInt(e.target.dataset.id);
                if (confirm('Tem certeza que deseja excluir esta conquista?')) {
                    appState.achievements = appState.achievements.filter(a => a.id !== achievementId);
                    saveToLS('achievements', appState.achievements);
                    renderAchievementsTable();
                    alert('Conquista excluída com sucesso!');
                }
            });
        });
    }
    
    // Formulário para adicionar nova conquista
    const addAchievementForm = document.getElementById('addAchievementForm');
    if (addAchievementForm) {
        addAchievementForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('achievementName').value.trim();
            const description = document.getElementById('achievementDesc').value.trim();
            const icon = document.getElementById('achievementIcon').value.trim();
            const xpRequirement = parseInt(document.getElementById('achievementXP').value);
            
            if (!name || !description) {
                alert('Por favor, preencha o nome e a descrição da conquista.');
                return;
            }
            
            // Gerar ID único para a nova conquista
            const newId = Math.max(...appState.achievements.map(a => a.id), 0) + 1;
            
            // Adicionar nova conquista
            appState.achievements.push({
                id: newId,
                name,
                description,
                icon: icon || 'images/achievements/default.jpg',
                xpRequirement
            });
            
            saveToLS('achievements', appState.achievements);
            alert('Conquista adicionada com sucesso!');
            addAchievementForm.reset();
            renderAchievementsTable();
        });
    }
    
    // Função para renderizar estatísticas
    function renderStats() {
        // Estatísticas básicas
        const totalStudentsEl = document.getElementById('totalStudents');
        const totalAchievementsEl = document.getElementById('totalAchievements');
        const totalXPEl = document.getElementById('totalXP');
        
        if (totalStudentsEl) totalStudentsEl.textContent = appState.students.length;
        if (totalAchievementsEl) totalAchievementsEl.textContent = appState.achievements.length;
        
        const totalXP = appState.students.reduce((sum, student) => sum + student.totalXp, 0);
        if (totalXPEl) totalXPEl.textContent = totalXP;
        
        // Distribuição de níveis
        const levelsDistributionBody = document.getElementById('levelsDistributionBody');
        if (levelsDistributionBody) {
            levelsDistributionBody.innerHTML = '';
            
            const levelCounts = {};
            appState.levels.forEach(level => {
                levelCounts[level.level] = 0;
            });
            
            appState.students.forEach(student => {
                const level = getLevelForXP(student.totalXp).level;
                levelCounts[level] = (levelCounts[level] || 0) + 1;
            });
            
            Object.keys(levelCounts).forEach(level => {
                const count = levelCounts[level];
                const percentage = appState.students.length > 0 
                    ? ((count / appState.students.length) * 100).toFixed(1) 
                    : 0;
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>Nível ${level}</td>
                    <td>${count}</td>
                    <td>${percentage}%</td>
                `;
                levelsDistributionBody.appendChild(row);
            });
        }
        
        // Conquistas mais populares
        const popularAchievementsBody = document.getElementById('popularAchievementsBody');
        if (popularAchievementsBody) {
            popularAchievementsBody.innerHTML = '';
            
            const achievementCounts = {};
            appState.achievements.forEach(achievement => {
                achievementCounts[achievement.id] = 0;
            });
            
            appState.students.forEach(student => {
                student.achievements.forEach(achievementId => {
                    achievementCounts[achievementId] = (achievementCounts[achievementId] || 0) + 1;
                });
            });
            
            // Converter para array e ordenar por popularidade
            const popularAchievements = Object.keys(achievementCounts)
                .map(id => {
                    const achievement = appState.achievements.find(a => a.id === parseInt(id));
                    return {
                        id: parseInt(id),
                        name: achievement ? achievement.name : 'Desconhecida',
                        count: achievementCounts[id],
                        percentage: appState.students.length > 0 
                            ? ((achievementCounts[id] / appState.students.length) * 100).toFixed(1) 
                            : 0
                    };
                })
                .filter(a => a.count > 0)
                .sort((a, b) => b.count - a.count);
            
            popularAchievements.forEach(achievement => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${achievement.name}</td>
                    <td>${achievement.count}</td>
                    <td>${achievement.percentage}%</td>
                `;
                popularAchievementsBody.appendChild(row);
            });
            
            if (popularAchievements.length === 0) {
                popularAchievementsBody.innerHTML = '<tr><td colspan="3" style="text-align: center;">Nenhuma conquista alcançada ainda.</td></tr>';
            }
        }
    }
    // Adicione esta função para o ranking expandido
function renderExpandedInteractiveRanking(container, studentsToDisplay) {
    container.innerHTML = ''; // Limpa o conteúdo
    
    if (studentsToDisplay.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #888;">Nenhum ranking disponível ainda.</p>';
        return;
    }
    
    // Adiciona cabeçalho
    const header = document.createElement('div');
    header.className = 'ranking-list-header';
    header.innerHTML = `
        <span>#</span>
        <span>Nome</span>
        <span>XP</span>
        <span>Nível</span>
    `;
    container.appendChild(header);
    
    // Adiciona itens do ranking
    studentsToDisplay.forEach((student, index) => {
        const levelInfo = getLevelForXP(student.totalXp);
        
        const rankingItem = document.createElement('div');
        rankingItem.className = 'ranking-item';
        rankingItem.innerHTML = `
            <span>${index + 1}</span>
            <span>${student.name}</span>
            <span>${student.totalXp}</span>
            <span style="color: ${levelInfo.color}; font-weight: bold;">${levelInfo.name}</span>
        `;
        
        container.appendChild(rankingItem);
    });
}
}

    // #region Inicialização da Aplicação
    // ===============================================================================================================

    // Roteamento simples baseado na URL
    const currentPage = window.location.pathname.split('/').pop();

    setupNavigation();
    assignFirstLoginAchievement(); // Atribui conquista de primeiro login ao carregar qualquer página

    if (currentPage === '' || currentPage === 'index.html') {
        initIndexPage();
    } else if (currentPage === 'profiles.html') {
        initProfilesPage();
    } else if (currentPage === 'games.html') {
        initGamesPage();
    } else if (currentPage === 'admin.html') {
        initAdminPage();
    }
    // ===============================================================================================================
    // #endregion
});