// script.js
let posts = JSON.parse(localStorage.getItem('posts')) || [];
let games = JSON.parse(localStorage.getItem('games')) || [];
let aboutContent = JSON.parse(localStorage.getItem('aboutContent')) || {
  pt: "",
  en: "",
  fr: "",
  ja: ""
};
let supportMessages = JSON.parse(localStorage.getItem('supportMessages')) || [];
let userLikes = JSON.parse(localStorage.getItem('userLikes')) || {};
let currentLanguage = 'pt';

// Carrega conteúdo ao iniciar
document.addEventListener('DOMContentLoaded', () => {
  carregarPosts();
  carregarJogos();
  carregarSobre();
  setupNavigation();
  setupSupportForm();
  checkNewPosts();
  loadLanguage();
  setupCategoryFilters();
});

function setupNavigation() {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const target = this.getAttribute('href');
      
      // Esconde todas as seções
      document.querySelectorAll('.category-section').forEach(section => {
        section.classList.add('hidden');
      });
      
      // Mostra a seção alvo
      document.querySelector(target).classList.remove('hidden');
      
      // Atualiza jogos por categoria se necessário
      if (target === '#earn-money') {
        carregarJogosPorCategoria('earn-money', 'earn-money-games');
      } else if (target === '#chatotaku') {
        carregarJogosPorCategoria('chatotaku', 'chatotaku-games');
      }
      
      // Rola suavemente para a seção
      document.querySelector(target).scrollIntoView({behavior: 'smooth'});
    });
  });
}

function carregarPosts() {
  const container = document.getElementById('postagens');
  if (!container) return;
  
  container.innerHTML = '';
  
  const now = new Date();
  const recentPosts = posts.filter(post => {
    const postDate = new Date(post.data);
    const diffHours = (now - postDate) / (1000 * 60 * 60);
    return diffHours <= 48;
  });

  if (recentPosts.length === 0) {
    container.innerHTML = '<p class="no-posts">Nenhuma novidade recente. Volte em breve!</p>';
    return;
  }

  recentPosts.slice().reverse().forEach(post => {
    const postElement = document.createElement('div');
    postElement.className = 'post';
    
    const userId = getUserId();
    const isLiked = userLikes[`post_${post.id}_${userId}`] || false;
    
    postElement.innerHTML = `
      <h3>${post.titulo}</h3>
      ${post.imagem ? `<a href="${post.link}" target="_blank"><img src="${post.imagem}" alt="${post.titulo}" onerror="this.style.display='none'"></a>` : ''}
      ${post.video ? `<div class="video-container">${post.video}</div>` : ''}
      ${post.descricao ? `<p>${post.descricao}</p>` : ''}
      <div class="post-interactions">
        <button class="like-btn ${isLiked ? 'liked' : ''}" data-post-id="${post.id}">
          <i class="${isLiked ? 'fas' : 'far'} fa-heart"></i> <span>${post.likes || 0}</span>
        </button>
        <button class="comment-btn" data-post-id="${post.id}">
          <i class="far fa-comment"></i> ${post.comments ? post.comments.length : 0}
        </button>
      </div>
      <div class="comments-section" id="comments-${post.id}" style="display:none;">
        <div class="comments-list"></div>
        <textarea class="comment-input" placeholder="Adicione um comentário..."></textarea>
        <button class="post-comment-btn" data-post-id="${post.id}">Publicar</button>
      </div>
      <small>Publicado em: ${new Date(post.data).toLocaleString()}</small>
    `;
    
    container.appendChild(postElement);
  });

  setupInteractionButtons();
}

function carregarJogos() {
  const container = document.getElementById('jogos-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  if (games.length === 0) {
    container.innerHTML = '<p class="no-posts">Nenhum jogo disponível ainda.</p>';
    return;
  }

  games.forEach(game => {
    const gameElement = document.createElement('div');
    gameElement.className = 'game-card';
    gameElement.setAttribute('data-category', game.categoria || 'all');
    
    const userId = getUserId();
    const isLiked = userLikes[`game_${game.id}_${userId}`] || false;
    
    gameElement.innerHTML = `
      <h3>${game.titulo}</h3>
      <div class="game-image-container">
        <img src="${game.imagem}" alt="${game.titulo}" onerror="this.style.display='none'">
        <a href="${game.link}" target="_blank" class="play-overlay-btn">JOGAR AGORA <i class="fas fa-play"></i></a>
      </div>
      <div class="game-description">${game.descricao || 'Descrição não disponível'}</div>
      <div class="game-interactions">
        <button class="like-btn ${isLiked ? 'liked' : ''}" data-game-id="${game.id}">
          <i class="${isLiked ? 'fas' : 'far'} fa-heart"></i> <span>${game.likes || 0}</span>
        </button>
        <a href="${game.link}" target="_blank" class="btn-jogar">JOGAR AGORA</a>
      </div>
    `;
    
    container.appendChild(gameElement);
  });

  setupInteractionButtons();
}

function carregarJogosPorCategoria(categoria, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = '';
  
  const jogosCategoria = games.filter(game => game.categoria === categoria);
  
  if (jogosCategoria.length === 0) {
    container.innerHTML = '<p class="no-posts">Nenhum jogo nesta categoria ainda.</p>';
    return;
  }

  jogosCategoria.forEach(game => {
    const gameElement = document.createElement('div');
    gameElement.className = 'game-card';
    
    const userId = getUserId();
    const isLiked = userLikes[`game_${game.id}_${userId}`] || false;
    
    gameElement.innerHTML = `
      <h3>${game.titulo}</h3>
      <div class="game-image-container">
        <img src="${game.imagem}" alt="${game.titulo}" onerror="this.style.display='none'">
        <a href="${game.link}" target="_blank" class="play-overlay-btn">JOGAR AGORA <i class="fas fa-play"></i></a>
      </div>
      <div class="game-description">${game.descricao || 'Descrição não disponível'}</div>
      <div class="game-interactions">
        <button class="like-btn ${isLiked ? 'liked' : ''}" data-game-id="${game.id}">
          <i class="${isLiked ? 'fas' : 'far'} fa-heart"></i> <span>${game.likes || 0}</span>
        </button>
        <a href="${game.link}" target="_blank" class="btn-jogar">JOGAR AGORA</a>
      </div>
    `;
    
    container.appendChild(gameElement);
  });

  setupInteractionButtons();
}

function setupCategoryFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  if (!filterButtons) return;
  
  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remove active class from all buttons
      filterButtons.forEach(btn => btn.classList.remove('active'));
      // Add active class to clicked button
      this.classList.add('active');
      
      const category = this.getAttribute('data-category');
      filterGamesByCategory(category);
    });
  });
}

function filterGamesByCategory(category) {
  const gameCards = document.querySelectorAll('.game-card');
  
  gameCards.forEach(card => {
    if (category === 'all' || card.getAttribute('data-category') === category) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

function carregarSobre() {
  const container = document.getElementById('sobre-content');
  if (!container) return;
  
  container.innerHTML = aboutContent[currentLanguage] || aboutContent.pt || "Conteúdo sobre a empresa será adicionado em breve.";
}

function setupSupportForm() {
  const form = document.getElementById('support-form');
  if (!form) return;
  
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('support-name').value.trim();
    const subject = document.getElementById('support-subject').value.trim();
    const message = document.getElementById('support-message').value.trim();
    
    if (!name || !subject || !message) {
      alert('Por favor, preencha todos os campos!');
      return;
    }
    
    const newMessage = {
      id: Date.now(),
      name,
      subject,
      message,
      date: new Date().toISOString(),
      read: false
    };
    
    supportMessages.push(newMessage);
    localStorage.setItem('supportMessages', JSON.stringify(supportMessages));
    
    form.reset();
    alert('Mensagem enviada com sucesso! Obrigado pelo seu feedback.');
  });
}

function setupInteractionButtons() {
  // Likes
  document.querySelectorAll('.like-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const postId = this.getAttribute('data-post-id');
      const gameId = this.getAttribute('data-game-id');
      const userId = getUserId();
      
      if (postId) {
        const post = posts.find(p => p.id === postId);
        if (post) {
          const userLikeKey = `post_${postId}_${userId}`;
          const hasLiked = userLikes[userLikeKey];
          
          if (hasLiked) {
            post.likes = Math.max(0, (post.likes || 0) - 1);
            delete userLikes[userLikeKey];
            this.classList.remove('liked');
            this.querySelector('i').className = 'far fa-heart';
          } else {
            post.likes = (post.likes || 0) + 1;
            userLikes[userLikeKey] = true;
            this.classList.add('liked');
            this.querySelector('i').className = 'fas fa-heart';
          }
          
          localStorage.setItem('posts', JSON.stringify(posts));
          localStorage.setItem('userLikes', JSON.stringify(userLikes));
          this.querySelector('span').textContent = post.likes;
        }
      } else if (gameId) {
        const game = games.find(g => g.id === gameId);
        if (game) {
          const userLikeKey = `game_${gameId}_${userId}`;
          const hasLiked = userLikes[userLikeKey];
          
          if (hasLiked) {
            game.likes = Math.max(0, (game.likes || 0) - 1);
            delete userLikes[userLikeKey];
            this.classList.remove('liked');
            this.querySelector('i').className = 'far fa-heart';
          } else {
            game.likes = (game.likes || 0) + 1;
            userLikes[userLikeKey] = true;
            this.classList.add('liked');
            this.querySelector('i').className = 'fas fa-heart';
          }
          
          localStorage.setItem('games', JSON.stringify(games));
          localStorage.setItem('userLikes', JSON.stringify(userLikes));
          this.querySelector('span').textContent = game.likes;
        }
      }
    });
  });
  
  // Comentários
  document.querySelectorAll('.comment-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const postId = this.getAttribute('data-post-id');
      const commentsSection = document.getElementById(`comments-${postId}`);
      
      if (commentsSection.style.display === 'none') {
        commentsSection.style.display = 'block';
        loadComments(postId);
      } else {
        commentsSection.style.display = 'none';
      }
    });
  });
  
  // Publicar comentários
  document.querySelectorAll('.post-comment-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const postId = this.getAttribute('data-post-id');
      const commentInput = this.previousElementSibling;
      const commentText = commentInput.value.trim();
      
      if (!commentText) return;
      
      const userName = prompt("Por favor, digite seu nome para o comentário:", "Anônimo") || "Anônimo";
      const userId = getUserId();
      
      const post = posts.find(p => p.id === postId);
      if (post) {
        if (!post.comments) post.comments = [];
        
        post.comments.push({
          id: Date.now(),
          text: commentText,
          date: new Date().toISOString(),
          author: userName,
          userId: userId
        });
        
        localStorage.setItem('posts', JSON.stringify(posts));
        commentInput.value = '';
        loadComments(postId);
        
        // Atualiza contador de comentários
        const commentBtn = document.querySelector(`.comment-btn[data-post-id="${postId}"]`);
        if (commentBtn) {
          commentBtn.innerHTML = `<i class="far fa-comment"></i> ${post.comments.length}`;
        }
        
        // Atualiza no admin
        window.dispatchEvent(new Event('storage'));
      }
    });
  });
}

function loadComments(postId) {
  const post = posts.find(p => p.id === postId);
  if (!post || !post.comments) return;
  
  const commentsList = document.querySelector(`#comments-${postId} .comments-list`);
  if (!commentsList) return;
  
  commentsList.innerHTML = '';
  
  post.comments.forEach(comment => {
    const commentElement = document.createElement('div');
    commentElement.className = 'comment';
    commentElement.innerHTML = `
      <strong>${comment.author}</strong>
      <p>${comment.text}</p>
      <small>${new Date(comment.date).toLocaleString()}</small>
    `;
    commentsList.appendChild(commentElement);
  });
}

function checkNewPosts() {
  const now = new Date();
  posts.forEach(post => {
    const postDate = new Date(post.data);
    const diffHours = (now - postDate) / (1000 * 60 * 60);
    
    // Se post tem mais de 48h e ainda não foi movido para jogos
    if (diffHours > 48 && !games.some(g => g.id === post.id)) {
      games.push({
        id: post.id,
        titulo: post.titulo,
        imagem: post.imagem,
        link: post.link,
        descricao: post.descricao,
        categoria: 'all',
        likes: post.likes || 0,
        data: post.data
      });
    }
  });
  
  localStorage.setItem('games', JSON.stringify(games));
}

// Sistema de idiomas
function changeLanguage(lang) {
  currentLanguage = lang;
  document.documentElement.id = `lang-${lang}`;
  localStorage.setItem('bobGamesLanguage', lang);
  
  // Atualiza todo o conteúdo
  carregarPosts();
  carregarJogos();
  carregarSobre();
  updateUITexts(lang);
}

function loadLanguage() {
  const savedLang = localStorage.getItem('bobGamesLanguage') || 'pt';
  document.getElementById('languageSelect').value = savedLang;
  changeLanguage(savedLang);
}

function updateUITexts(lang) {
  const translations = {
    pt: {
      title: "Bob Games",
      subtitle: "Os melhores jogos online em um só lugar!",
      news: "📢 Novidades",
      games: "🎮 Todos os Jogos",
      earnMoney: "💰 Earn Money",
      chatotaku: "🐱 ChaTOTaku",
      about: "ℹ️ Sobre Nós",
      support: "🆘 Support",
      noPosts: "Nenhuma novidade recente. Volte em breve!",
      noGames: "Nenhum jogo disponível ainda.",
      noCategoryGames: "Nenhum jogo nesta categoria ainda.",
      playNow: "JOGAR AGORA",
      commentPlaceholder: "Adicione um comentário...",
      publishComment: "Publicar",
      footer: "© 2025 Bob Games - Todos os direitos reservados",
      namePrompt: "Por favor, digite seu nome para o comentário:"
    },
    en: {
      title: "Bob Games",
      subtitle: "The best online games in one place!",
      news: "📢 News",
      games: "🎮 All Games",
      earnMoney: "💰 Earn Money",
      chatotaku: "🐱 ChaTOTaku",
      about: "ℹ️ About Us",
      support: "🆘 Support",
      noPosts: "No recent news. Come back soon!",
      noGames: "No games available yet.",
      noCategoryGames: "No games in this category yet.",
      playNow: "PLAY NOW",
      commentPlaceholder: "Add a comment...",
      publishComment: "Publish",
      footer: "© 2025 Bob Games - All rights reserved",
      namePrompt: "Please enter your name for the comment:"
    },
    fr: {
      title: "Bob Games",
      subtitle: "Les meilleurs jeux en ligne en un seul endroit!",
      news: "📢 Nouvelles",
      games: "🎮 Tous les jeux",
      earnMoney: "💰 Gagner de l'argent",
      chatotaku: "🐱 ChaTOTaku",
      about: "ℹ️ À propos",
      support: "🆘 Support",
      noPosts: "Pas de nouvelles récentes. Revenez bientôt!",
      noGames: "Aucun jeu disponible pour le moment.",
      noCategoryGames: "Aucun jeu dans cette catégorie pour le moment.",
      playNow: "JOUER MAINTENANT",
      commentPlaceholder: "Ajouter un commentaire...",
      publishComment: "Publier",
      footer: "© 2025 Bob Games - Tous droits réservés",
      namePrompt: "Veuillez entrer votre nom pour le commentaire:"
    },
    ja: {
      title: "ボブゲームズ",
      subtitle: "最高のオンラインゲームがここに！",
      news: "📢 ニュース",
      games: "🎮 すべてのゲーム",
      earnMoney: "💰 お金を稼ぐ",
      chatotaku: "🐱 チャトタク",
      about: "ℹ️ 会社概要",
      support: "🆘 サポート",
      noPosts: "最近のニュースはありません。また後でチェックしてください！",
      noGames: "まだ利用可能なゲームはありません。",
      noCategoryGames: "このカテゴリにはまだゲームがありません。",
      playNow: "今すぐプレイ",
      commentPlaceholder: "コメントを追加...",
      publishComment: "公開",
      footer: "© 2025 ボブゲームズ - 全著作権所有",
      namePrompt: "コメント用にあなたの名前を入力してください:"
    }
  };
  
  const t = translations[lang] || translations['pt'];
  
  // Atualizar elementos da página
  if (document.querySelector('title')) document.querySelector('title').textContent = t.title;
  if (document.querySelector('header h1')) document.querySelector('header h1').textContent = `🎮 ${t.title}`;
  if (document.querySelector('header p')) document.querySelector('header p').textContent = t.subtitle;
  if (document.querySelector('footer p')) document.querySelector('footer p').textContent = t.footer;
  
  // Atualizar textos dos links de navegação
  const navLinks = document.querySelectorAll('.nav-link');
  if (navLinks.length > 0) {
    navLinks[0].textContent = t.news;
    navLinks[1].textContent = t.games;
    navLinks[2].textContent = t.earnMoney;
    navLinks[3].textContent = t.chatotaku;
    navLinks[4].textContent = t.about;
    navLinks[5].textContent = t.support;
  }
  
  // Atualizar textos de seção
  const sectionTitles = document.querySelectorAll('.section-title');
  if (sectionTitles.length > 0) {
    sectionTitles[0].textContent = t.news;
    if (sectionTitles[1]) sectionTitles[1].textContent = t.games;
    if (sectionTitles[2]) sectionTitles[2].textContent = t.earnMoney;
    if (sectionTitles[3]) sectionTitles[3].textContent = t.chatotaku;
    if (sectionTitles[4]) sectionTitles[4].textContent = t.about;
    if (sectionTitles[5]) sectionTitles[5].textContent = t.support;
  }
  
  // Atualizar mensagens de "sem conteúdo"
  document.querySelectorAll('.no-posts').forEach(el => {
    if (el.id === 'postagens' || el.classList.contains('no-posts')) {
      el.textContent = t.noPosts;
    } else if (el.id === 'jogos-container') {
      el.textContent = t.noGames;
    } else {
      el.textContent = t.noCategoryGames;
    }
  });
  
  // Atualizar botões e placeholders
  document.querySelectorAll('.btn-jogar, .play-overlay-btn').forEach(el => {
    el.textContent = t.playNow;
  });
  
  document.querySelectorAll('.comment-input').forEach(el => {
    el.placeholder = t.commentPlaceholder;
  });
  
  document.querySelectorAll('.post-comment-btn').forEach(el => {
    el.textContent = t.publishComment;
  });
}

function getUserId() {
  let userId = localStorage.getItem('bobGamesUserId');
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('bobGamesUserId', userId);
  }
  return userId;
}

// Atualiza quando houver mudanças no localStorage
window.addEventListener('storage', () => {
  posts = JSON.parse(localStorage.getItem('posts')) || [];
  games = JSON.parse(localStorage.getItem('games')) || [];
  aboutContent = JSON.parse(localStorage.getItem('aboutContent')) || {pt: "", en: "", fr: "", ja: ""};
  userLikes = JSON.parse(localStorage.getItem('userLikes')) || {};
  carregarPosts();
  carregarJogos();
  carregarSobre();
});