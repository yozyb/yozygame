// painel.js
let posts = JSON.parse(localStorage.getItem('posts')) || [];
let games = JSON.parse(localStorage.getItem('games')) || [];
let aboutContent = JSON.parse(localStorage.getItem('aboutContent')) || {
  pt: "",
  en: "",
  fr: "",
  ja: ""
};
let supportMessages = JSON.parse(localStorage.getItem('supportMessages')) || [];
let currentLanguage = 'pt';

// Carrega conteúdo ao iniciar
document.addEventListener('DOMContentLoaded', () => {
  carregarPosts();
  carregarJogos();
  carregarSupportMessages();
  carregarConteudoSobre();
  setupLanguageSelector();
});

function setupLanguageSelector() {
  const selector = document.getElementById('languageSelect');
  if (selector) {
    selector.addEventListener('change', (e) => {
      currentLanguage = e.target.value;
      updateUITexts(currentLanguage);
    });
  }
}

function carregarPosts() {
  const container = document.getElementById('listaPosts');
  if (!container) return;
  
  container.innerHTML = '';
  
  if (posts.length === 0) {
    container.innerHTML = '<p class="no-posts">Nenhuma publicação ativa.</p>';
    return;
  }

  posts.slice().reverse().forEach(post => {
    const postElement = document.createElement('div');
    postElement.className = 'post-item admin-post';
    
    // Verifica se é uma novidade (menos de 48h)
    const now = new Date();
    const postDate = new Date(post.data);
    const diffHours = (now - postDate) / (1000 * 60 * 60);
    const isNew = diffHours <= 48;
    
    postElement.innerHTML = `
      <div class="post-header">
        <h3>${post.titulo}</h3>
        <span class="post-status ${isNew ? 'new' : ''}">${isNew ? 'NOVO' : 'ARQUIVADO'}</span>
      </div>
      ${post.imagem ? `<img src="${post.imagem}" alt="${post.titulo}" onerror="this.style.display='none'">` : ''}
      ${post.video ? `<div class="video-container">${post.video}</div>` : ''}
      <p><strong>Link:</strong> <a href="${post.link}" target="_blank">${post.link}</a></p>
      ${post.descricao ? `<p>${post.descricao}</p>` : ''}
      <div class="post-stats">
        <p><i class="fas fa-heart"></i> ${post.likes || 0} curtidas</p>
        <p><i class="fas fa-comment"></i> ${post.comments ? post.comments.length : 0} comentários</p>
      </div>
      <div class="post-comments-preview">
        ${post.comments && post.comments.length > 0 ? `
          <h4>Últimos comentários:</h4>
          ${post.comments.slice(-2).map(comment => `
            <div class="comment-preview">
              <strong>${comment.author}</strong>: ${comment.text.substring(0, 50)}${comment.text.length > 50 ? '...' : ''}
            </div>
          `).join('')}
        ` : ''}
      </div>
      <small>Publicado em: ${new Date(post.data).toLocaleString()}</small>
      <button class="btn-remover-post" data-post-id="${post.id}">🗑️ Remover</button>
      <hr>
    `;
    
    container.appendChild(postElement);
  });

  // Adiciona event listeners para os botões de remover
  document.querySelectorAll('.btn-remover-post').forEach(btn => {
    btn.addEventListener('click', function() {
      const postId = this.getAttribute('data-post-id');
      removerPostPorId(postId);
    });
  });
}

function carregarJogos() {
  const container = document.getElementById('listaJogos');
  if (!container) return;
  
  container.innerHTML = '';
  
  if (games.length === 0) {
    container.innerHTML = '<p class="no-posts">Nenhum jogo publicado ainda.</p>';
    return;
  }

  games.slice().reverse().forEach(game => {
    const gameElement = document.createElement('div');
    gameElement.className = 'game-item admin-game';
    
    gameElement.innerHTML = `
      <div class="game-header">
        <h3>${game.titulo}</h3>
        <span class="game-category">${getCategoryName(game.categoria)}</span>
      </div>
      ${game.imagem ? `<img src="${game.imagem}" alt="${game.titulo}" onerror="this.style.display='none'">` : ''}
      <p><strong>Link:</strong> <a href="${game.link}" target="_blank">${game.link}</a></p>
      ${game.descricao ? `<div class="game-description"><p>${game.descricao}</p></div>` : ''}
      <div class="game-stats">
        <p><i class="fas fa-heart"></i> ${game.likes || 0} curtidas</p>
      </div>
      <small>Publicado em: ${new Date(game.data).toLocaleString()}</small>
      <button class="btn-remover-jogo" data-game-id="${game.id}">🗑️ Remover</button>
      <hr>
    `;
    
    container.appendChild(gameElement);
  });

  // Adiciona event listeners para os botões de remover
  document.querySelectorAll('.btn-remover-jogo').forEach(btn => {
    btn.addEventListener('click', function() {
      const gameId = this.getAttribute('data-game-id');
      removerJogoPorId(gameId);
    });
  });
}

function getCategoryName(category) {
  const categories = {
    'all': 'Todos',
    'earn-money': '💰 Earn Money',
    'chatotaku': '🐱 ChaTOTaku',
    'action': '🎯 Ação',
    'adventure': '🧭 Aventura'
  };
  return categories[category] || category;
}

function carregarSupportMessages() {
  const container = document.getElementById('listaSupportMessages');
  if (!container) return;
  
  container.innerHTML = '';
  
  if (supportMessages.length === 0) {
    container.innerHTML = '<p class="no-posts">Nenhuma mensagem de suporte recebida.</p>';
    return;
  }

  supportMessages.slice().reverse().forEach(msg => {
    const msgElement = document.createElement('div');
    msgElement.className = `support-message ${msg.read ? 'read' : 'unread'}`;
    
    msgElement.innerHTML = `
      <div class="message-header">
        <h3>${msg.subject}</h3>
        <span class="message-status">${msg.read ? 'LIDA' : 'NOVA'}</span>
      </div>
      <p><strong>De:</strong> ${msg.name}</p>
      <p><strong>Data:</strong> ${new Date(msg.date).toLocaleString()}</p>
      <div class="message-content">
        <p>${msg.message}</p>
      </div>
      <div class="message-actions">
        <button class="btn-reply" data-msg-id="${msg.id}">✉️ Responder</button>
        <button class="btn-mark-read" data-msg-id="${msg.id}">✓ Marcar como lida</button>
        <button class="btn-delete-msg" data-msg-id="${msg.id}">🗑️ Excluir</button>
      </div>
      <hr>
    `;
    
    container.appendChild(msgElement);
  });

  // Adiciona event listeners para os botões
  document.querySelectorAll('.btn-mark-read').forEach(btn => {
    btn.addEventListener('click', function() {
      const msgId = this.getAttribute('data-msg-id');
      marcarMensagemComoLida(msgId);
    });
  });

  document.querySelectorAll('.btn-delete-msg').forEach(btn => {
    btn.addEventListener('click', function() {
      const msgId = this.getAttribute('data-msg-id');
      removerMensagem(msgId);
    });
  });
}

function carregarConteudoSobre() {
  document.getElementById('sobre-pt').value = aboutContent.pt || '';
  document.getElementById('sobre-en').value = aboutContent.en || '';
  document.getElementById('sobre-fr').value = aboutContent.fr || '';
  document.getElementById('sobre-ja').value = aboutContent.ja || '';
}

function publicarPost(event) {
  event.preventDefault();
  
  const titulo = document.getElementById('titulo').value.trim();
  const imagem = document.getElementById('imagem').value.trim();
  const video = document.getElementById('video').value.trim();
  const link = document.getElementById('link').value.trim();
  const descricao = document.getElementById('descricao').value.trim();

  // Validação dos campos obrigatórios
  if (!titulo || !link) {
    alert('Preencha pelo menos o Título e o Link!');
    return;
  }

  // Validação de URL se imagem ou vídeo foram fornecidos
  if (imagem) {
    try {
      new URL(imagem);
    } catch (e) {
      alert('Por favor, insira uma URL válida para a imagem!');
      return;
    }
  }

  if (video) {
    try {
      new URL(video);
    } catch (e) {
      alert('Por favor, insira uma URL válida para o vídeo!');
      return;
    }
  }

  const novoPost = {
    id: Date.now().toString(),
    titulo,
    imagem: imagem || null,
    video: video ? `<iframe src="${video}" frameborder="0" allowfullscreen></iframe>` : null,
    link,
    descricao: descricao || null,
    data: new Date().toISOString(),
    likes: 0,
    comments: []
  };

  posts.push(novoPost);
  localStorage.setItem('posts', JSON.stringify(posts));
  
  // Atualiza a exibição
  carregarPosts();
  
  // Limpa o formulário
  event.target.reset();
  
  alert('✅ Publicação criada com sucesso!');
  
  // Dispara evento para atualizar o site principal
  window.dispatchEvent(new Event('storage'));
}

function publicarJogo(event) {
  event.preventDefault();
  
  const titulo = document.getElementById('jogo-titulo').value.trim();
  const imagem = document.getElementById('jogo-imagem').value.trim();
  const link = document.getElementById('jogo-link').value.trim();
  const descricao = document.getElementById('jogo-descricao').value.trim();
  const categoria = document.getElementById('jogo-categoria').value;

  // Validação
  if (!titulo || !imagem || !link || !descricao) {
    alert('Preencha todos os campos obrigatórios!');
    return;
  }

  try {
    new URL(imagem);
    new URL(link);
  } catch (e) {
    alert('Por favor, insira URLs válidas para a imagem e o link!');
    return;
  }

  const novoJogo = {
    id: Date.now().toString(),
    titulo,
    imagem,
    link,
    descricao,
    categoria,
    data: new Date().toISOString(),
    likes: 0
  };

  games.push(novoJogo);
  localStorage.setItem('games', JSON.stringify(games));
  
  // Atualiza a exibição
  carregarJogos();
  
  // Limpa o formulário
  event.target.reset();
  
  alert('✅ Jogo publicado com sucesso!');
  
  // Dispara evento para atualizar o site principal
  window.dispatchEvent(new Event('storage'));
}

function atualizarSobre(event) {
  event.preventDefault();
  
  const sobrePt = document.getElementById('sobre-pt').value.trim();
  const sobreEn = document.getElementById('sobre-en').value.trim();
  const sobreFr = document.getElementById('sobre-fr').value.trim();
  const sobreJa = document.getElementById('sobre-ja').value.trim();

  if (!sobrePt) {
    alert('O conteúdo em Português é obrigatório!');
    return;
  }

  aboutContent = {
    pt: sobrePt,
    en: sobreEn,
    fr: sobreFr,
    ja: sobreJa
  };

  localStorage.setItem('aboutContent', JSON.stringify(aboutContent));
  alert('Conteúdo "Sobre Nós" atualizado com sucesso!');
  window.dispatchEvent(new Event('storage'));
}

function removerPost(event) {
  event.preventDefault();
  
  const titulo = document.getElementById('tituloRemover').value.trim();
  
  if (!titulo) {
    alert('Digite o título da publicação que deseja remover!');
    return;
  }

  const index = posts.findIndex(p => p.titulo.toLowerCase() === titulo.toLowerCase());
  
  if (index === -1) {
    alert(`Publicação "${titulo}" não encontrada!`);
    return;
  }

  if (confirm(`Tem certeza que deseja remover permanentemente "${posts[index].titulo}"?`)) {
    posts.splice(index, 1);
    localStorage.setItem('posts', JSON.stringify(posts));
    
    // Remove também dos jogos se estiver lá
    const gameIndex = games.findIndex(g => g.titulo.toLowerCase() === titulo.toLowerCase());
    if (gameIndex !== -1) {
      games.splice(gameIndex, 1);
      localStorage.setItem('games', JSON.stringify(games));
    }
    
    // Atualiza a exibição
    carregarPosts();
    carregarJogos();
    
    // Limpa o campo
    document.getElementById('tituloRemover').value = '';
    
    alert('🗑️ Publicação removida com sucesso!');
    
    // Dispara evento para atualizar o site principal
    window.dispatchEvent(new Event('storage'));
  }
}

function removerPostPorId(postId) {
  const post = posts.find(p => p.id === postId);
  if (!post) return;

  if (confirm(`Tem certeza que deseja remover permanentemente "${post.titulo}"?`)) {
    posts = posts.filter(p => p.id !== postId);
    localStorage.setItem('posts', JSON.stringify(posts));
    
    // Remove também dos jogos se estiver lá
    games = games.filter(g => g.id !== postId);
    localStorage.setItem('games', JSON.stringify(games));
    
    // Atualiza a exibição
    carregarPosts();
    carregarJogos();
    
    alert('🗑️ Publicação removida com sucesso!');
    
    // Dispara evento para atualizar o site principal
    window.dispatchEvent(new Event('storage'));
  }
}

function removerJogoPorId(gameId) {
  const game = games.find(g => g.id === gameId);
  if (!game) return;

  if (confirm(`Tem certeza que deseja remover permanentemente "${game.titulo}"?`)) {
    games = games.filter(g => g.id !== gameId);
    localStorage.setItem('games', JSON.stringify(games));
    
    // Atualiza a exibição
    carregarJogos();
    
    alert('🗑️ Jogo removido com sucesso!');
    
    // Dispara evento para atualizar o site principal
    window.dispatchEvent(new Event('storage'));
  }
}

function marcarMensagemComoLida(msgId) {
  const msg = supportMessages.find(m => m.id == msgId);
  if (msg) {
    msg.read = true;
    localStorage.setItem('supportMessages', JSON.stringify(supportMessages));
    carregarSupportMessages();
  }
}

function removerMensagem(msgId) {
  if (confirm('Tem certeza que deseja excluir esta mensagem permanentemente?')) {
    supportMessages = supportMessages.filter(m => m.id != msgId);
    localStorage.setItem('supportMessages', JSON.stringify(supportMessages));
    carregarSupportMessages();
  }
}

function updateUITexts(lang) {
  const translations = {
    pt: {
      title: "Painel do Administrador - Bob Games",
      subtitle: "Gerenciamento de Conteúdo - Bob Games",
      newPost: "📝 Nova Publicação",
      newGame: "🎮 Publicar Novo Jogo",
      about: "ℹ️ Sobre Nós",
      removePost: "❌ Remover Publicação",
      activePosts: "📰 Publicações Ativas",
      publishedGames: "🎮 Jogos Publicados",
      supportMessages: "📩 Mensagens de Suporte",
      noPosts: "Nenhuma publicação ativa.",
      noGames: "Nenhum jogo publicado ainda.",
      noMessages: "Nenhuma mensagem de suporte recebida.",
      publishBtn: "Publicar",
      publishGameBtn: "Publicar Jogo",
      updateAboutBtn: "Atualizar Conteúdo",
      removeBtn: "🗑️ Remover Publicação",
      read: "LIDA",
      unread: "NOVA",
      reply: "✉️ Responder",
      markRead: "✓ Marcar como lida",
      deleteMsg: "🗑️ Excluir",
      newStatus: "NOVO",
      archivedStatus: "ARQUIVADO"
    },
    en: {
      title: "Admin Panel - Bob Games",
      subtitle: "Content Management - Bob Games",
      newPost: "📝 New Post",
      newGame: "🎮 Publish New Game",
      about: "ℹ️ About Us",
      removePost: "❌ Remove Post",
      activePosts: "📰 Active Posts",
      publishedGames: "🎮 Published Games",
      supportMessages: "📩 Support Messages",
      noPosts: "No active posts.",
      noGames: "No games published yet.",
      noMessages: "No support messages received.",
      publishBtn: "Publish",
      publishGameBtn: "Publish Game",
      updateAboutBtn: "Update Content",
      removeBtn: "🗑️ Remove Post",
      read: "READ",
      unread: "NEW",
      reply: "✉️ Reply",
      markRead: "✓ Mark as read",
      deleteMsg: "🗑️ Delete",
      newStatus: "NEW",
      archivedStatus: "ARCHIVED"
    },
    fr: {
      title: "Panneau d'administration - Bob Games",
      subtitle: "Gestion de contenu - Bob Games",
      newPost: "📝 Nouvelle Publication",
      newGame: "🎮 Publier un Nouveau Jeu",
      about: "ℹ️ À propos",
      removePost: "❌ Supprimer Publication",
      activePosts: "📰 Publications Actives",
      publishedGames: "🎮 Jeux Publiés",
      supportMessages: "📩 Messages de Support",
      noPosts: "Aucune publication active.",
      noGames: "Aucun jeu publié pour le moment.",
      noMessages: "Aucun message de support reçu.",
      publishBtn: "Publier",
      publishGameBtn: "Publier Jeu",
      updateAboutBtn: "Mettre à jour",
      removeBtn: "🗑️ Supprimer Publication",
      read: "LUE",
      unread: "NOUVELLE",
      reply: "✉️ Répondre",
      markRead: "✓ Marquer comme lue",
      deleteMsg: "🗑️ Supprimer",
      newStatus: "NOUVEAU",
      archivedStatus: "ARCHIVÉ"
    },
    ja: {
      title: "管理者パネル - ボブゲームズ",
      subtitle: "コンテンツ管理 - ボブゲームズ",
      newPost: "📝 新しい投稿",
      newGame: "🎮 新しいゲームを公開",
      about: "ℹ️ 会社概要",
      removePost: "❌ 投稿を削除",
      activePosts: "📰 アクティブな投稿",
      publishedGames: "🎮 公開済みゲーム",
      supportMessages: "📩 サポートメッセージ",
      noPosts: "アクティブな投稿はありません。",
      noGames: "まだ公開されているゲームはありません。",
      noMessages: "サポートメッセージはありません。",
      publishBtn: "公開",
      publishGameBtn: "ゲームを公開",
      updateAboutBtn: "コンテンツを更新",
      removeBtn: "🗑️ 投稿を削除",
      read: "既読",
      unread: "新着",
      reply: "✉️ 返信",
      markRead: "✓ 既読にする",
      deleteMsg: "🗑 削除",
      newStatus: "新着",
      archivedStatus: "アーカイブ"
    }
  };
  
  const t = translations[lang] || translations['pt'];
  
  // Atualizar cabeçalho
  document.querySelector('header h1').textContent = t.title;
  document.querySelector('header p').textContent = t.subtitle;
  
  // Atualizar títulos das seções
  const sectionTitles = document.querySelectorAll('.admin-section h2');
  if (sectionTitles.length >= 6) {
    sectionTitles[0].textContent = t.newPost;
    sectionTitles[1].textContent = t.newGame;
    sectionTitles[2].textContent = t.about;
    sectionTitles[3].textContent = t.removePost;
    sectionTitles[4].textContent = t.activePosts;
    sectionTitles[5].textContent = t.publishedGames;
    if (sectionTitles[6]) sectionTitles[6].textContent = t.supportMessages;
  }
  
  // Atualizar botões
  document.querySelectorAll('#formPublicar button').forEach(btn => {
    btn.textContent = t.publishBtn;
  });
  
  document.querySelectorAll('#formPublicarJogo button').forEach(btn => {
    btn.textContent = t.publishGameBtn;
  });
  
  document.querySelectorAll('#formSobre button').forEach(btn => {
    btn.textContent = t.updateAboutBtn;
  });
  
  document.querySelectorAll('#formRemover button').forEach(btn => {
    btn.textContent = t.removeBtn;
  });
  
  // Atualizar mensagens de "sem conteúdo"
  document.querySelectorAll('.no-posts').forEach(el => {
    if (el.id === 'listaPosts') {
      el.textContent = t.noPosts;
    } else if (el.id === 'listaJogos') {
      el.textContent = t.noGames;
    } else {
      el.textContent = t.noMessages;
    }
  });
  
  // Atualizar status e botões nas mensagens
  document.querySelectorAll('.post-status.new').forEach(el => {
    el.textContent = t.newStatus;
  });
  
  document.querySelectorAll('.post-status:not(.new)').forEach(el => {
    el.textContent = t.archivedStatus;
  });
  
  document.querySelectorAll('.message-status').forEach(el => {
    el.textContent = el.parentElement.parentElement.classList.contains('read') ? t.read : t.unread;
  });
  
  document.querySelectorAll('.btn-reply').forEach(el => {
    el.textContent = t.reply;
  });
  
  document.querySelectorAll('.btn-mark-read').forEach(el => {
    el.textContent = t.markRead;
  });
  
  document.querySelectorAll('.btn-delete-msg').forEach(el => {
    el.textContent = t.deleteMsg;
  });
}

// Atualiza quando houver mudanças no localStorage
window.addEventListener('storage', () => {
  posts = JSON.parse(localStorage.getItem('posts')) || [];
  games = JSON.parse(localStorage.getItem('games')) || [];
  aboutContent = JSON.parse(localStorage.getItem('aboutContent')) || {pt: "", en: "", fr: "", ja: ""};
  supportMessages = JSON.parse(localStorage.getItem('supportMessages')) || [];
  carregarPosts();
  carregarJogos();
  carregarSupportMessages();
  carregarConteudoSobre();
});