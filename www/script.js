// Estados Globais
let usuarioLogado = null;
let usuariosCadastrados = JSON.parse(localStorage.getItem('run_users')) || [];
let eventosCalendario = JSON.parse(localStorage.getItem('run_eventos')) || [
    { id: 1, nome: "Maratona de Porto Alegre", data: "2026-10-31T08:00" }
];
let treinosSalvos = JSON.parse(localStorage.getItem('run_treinos')) || [];
let mensagensChat = JSON.parse(localStorage.getItem('run_chat')) || [];

document.addEventListener('DOMContentLoaded', () => {
    carregarGaleriaSalva();
    renderizarCalendario();
    renderizarTreinos();
    carregarChat();
    setInterval(atualizarCronometro, 1000);
});

// 1. Controle de Abas
function openTab(tabName) {
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(c => c.classList.remove('active-content'));

    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(b => b.classList.remove('active'));

    if (!usuarioLogado && tabName !== 'home') {
        document.getElementById('tab-bloqueado').classList.add('active-content');
        return;
    }

    document.getElementById(`tab-${tabName}`).classList.add('active-content');
    
    const activeBtn = Array.from(buttons).find(b => b.getAttribute('onclick').includes(tabName));
    if (activeBtn) activeBtn.classList.add('active');
}

function openAuthModal() {
    document.getElementById('modalAuth').style.display = 'flex';
}

// 2. Modais e Login
const modalAuth = document.getElementById('modalAuth');
const btnLogin = document.getElementById('btnLogin');
const btnCloseModal = document.getElementById('btnCloseModal');

if (btnLogin) btnLogin.addEventListener('click', openAuthModal);
if (btnCloseModal) btnCloseModal.addEventListener('click', () => modalAuth.style.display = 'none');

function switchAuthMode(mode) {
    document.getElementById('tabLoginBtn').classList.toggle('active', mode === 'login');
    document.getElementById('tabRegisterBtn').classList.toggle('active', mode === 'register');
    document.getElementById('formLogin').classList.toggle('active-form', mode === 'login');
    document.getElementById('formRegister').classList.toggle('active-form', mode === 'register');
}

document.getElementById('formRegister').addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const pass = document.getElementById('regPassword').value;

    const existe = usuariosCadastrados.find(u => u.username === user || u.email === email);
    if (existe) return alert('Usuário ou e-mail já existe!');

    usuariosCadastrados.push({ id: Date.now(), username: user, email: email, password: pass });
    localStorage.setItem('run_users', JSON.stringify(usuariosCadastrados));
    alert('Conta criada com sucesso!');
    switchAuthMode('login');
});

document.getElementById('formLogin').addEventListener('submit', (e) => {
    e.preventDefault();
    const loginInput = document.getElementById('loginUsername').value.trim();
    const passInput = document.getElementById('loginPassword').value;

    const user = usuariosCadastrados.find(u => (u.username === loginInput || u.email === loginInput) && u.password === passInput);
    if (user) {
        usuarioLogado = user;
        btnLogin.innerText = `Olá, ${usuarioLogado.username}`;
        modalAuth.style.display = 'none';
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('locked'));
        openTab('home');
    } else {
        alert('Dados incorretos!');
    }
});

// 3. Admin Login & Painel
const modalAdmin = document.getElementById('modalAdmin');
const adminModalBox = document.getElementById('adminModalBox');
const adminLoginForm = document.getElementById('adminLoginForm');
const adminDashboard = document.getElementById('adminDashboard');

document.getElementById('btnOpenAdmin').addEventListener('click', () => {
    adminLoginForm.classList.remove('hidden');
    adminDashboard.classList.add('hidden');
    adminModalBox.classList.remove('modal-expanded');
    modalAdmin.style.display = 'flex';
});

document.getElementById('btnCloseAdmin').addEventListener('click', () => {
    modalAdmin.style.display = 'none';
});

document.getElementById('formAdminAuth').addEventListener('submit', (e) => {
    e.preventDefault();
    const senha = document.getElementById('inputAdminPass').value;
    
    if (senha === 'admin123') {
        adminLoginForm.classList.add('hidden');
        adminDashboard.classList.remove('hidden');
        adminModalBox.classList.add('modal-expanded');
        carregarTabelaAdmin();
        document.getElementById('inputAdminPass').value = '';
    } else {
        alert('Senha de administrador incorreta!');
    }
});

document.getElementById('formAdminEvento').addEventListener('submit', (e) => {
    e.preventDefault();
    const nome = document.getElementById('adminNomeEvento').value;
    const data = document.getElementById('adminDataEvento').value;

    eventosCalendario.push({ id: Date.now(), nome, data });
    localStorage.setItem('run_eventos', JSON.stringify(eventosCalendario));
    renderizarCalendario();
    alert('Prova cadastrada com sucesso!');
    document.getElementById('formAdminEvento').reset();
});

function renderizarCalendario() {
    const lista = document.getElementById('listaEventosCalendario');
    if (!lista) return;
    lista.innerHTML = '';

    eventosCalendario.sort((a, b) => new Date(a.data) - new Date(b.data));

    if (eventosCalendario.length > 0) {
        const proximo = eventosCalendario[0];
        document.getElementById('tituloMaratona').innerText = proximo.nome;
        const d = new Date(proximo.data);
        document.getElementById('dataMaratonaText').innerText = `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
    }

    eventosCalendario.forEach(e => {
        const d = new Date(e.data);
        const div = document.createElement('div');
        div.classList.add('evento-item');
        div.innerHTML = `
            <div>
                <strong>${e.nome}</strong><br>
                <small>${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()} - ${d.getHours()}:${d.getMinutes() < 10 ? '0' : ''}${d.getMinutes()}h</small>
            </div>
            <button class="btn-danger-sm" onclick="deletarEvento(${e.id})">Excluir</button>
        `;
        lista.appendChild(div);
    });
}

function deletarEvento(id) {
    eventosCalendario = eventosCalendario.filter(e => e.id !== id);
    localStorage.setItem('run_eventos', JSON.stringify(eventosCalendario));
    renderizarCalendario();
}

function carregarTabelaAdmin() {
    const tbody = document.getElementById('adminUsersTable');
    tbody.innerHTML = '';
    usuariosCadastrados.forEach(u => {
        tbody.innerHTML += `<tr><td>${u.username}</td><td>${u.email}</td><td><button class="btn-danger-sm" onclick="deletarUsuario(${u.id})">Excluir</button></td></tr>`;
    });
}

function deletarUsuario(id) {
    usuariosCadastrados = usuariosCadastrados.filter(u => u.id !== id);
    localStorage.setItem('run_users', JSON.stringify(usuariosCadastrados));
    carregarTabelaAdmin();
}

// 4. Metas, Treinos, Pace & Feed Interativo
function calcularPace() {
    const dist = parseFloat(document.getElementById('paceDistancia').value);
    const tempo = parseFloat(document.getElementById('paceTempo').value);
    if (dist > 0 && tempo > 0) {
        const paceDecimal = tempo / dist;
        const min = Math.floor(paceDecimal);
        const seg = Math.round((paceDecimal - min) * 60);
        document.getElementById('paceResultado').innerText = `Seu pace médio: ${min}'${seg < 10 ? '0' : ''}${seg}" /km`;
    }
}

document.getElementById('formTreino').addEventListener('submit', (e) => {
    e.preventDefault();
    const dist = parseFloat(document.getElementById('inputDistancia').value);
    const dif = document.getElementById('selectDificuldade').value;
    const sup = document.getElementById('inputSuperacao').value;

    const novoTreino = {
        id: Date.now(),
        usuario: usuarioLogado ? usuarioLogado.username : 'Atleta',
        distancia: dist,
        dificuldade: dif,
        superacao: sup,
        curtidas: 0,
        comentarios: []
    };

    treinosSalvos.unshift(novoTreino);
    localStorage.setItem('run_treinos', JSON.stringify(treinosSalvos));
    renderizarTreinos();
    document.getElementById('formTreino').reset();
});

function renderizarTreinos() {
    const feed = document.getElementById('feedConquistas');
    if (!feed) return;
    feed.innerHTML = '';
    let totalKm = 0;

    treinosSalvos.forEach(t => {
        totalKm += t.distancia;
        
        let comentariosHtml = (t.comentarios || []).map(c => `
            <div style="font-size: 12px; margin-top: 4px; color: #cbd5e1;">
                <strong>${c.usuario}:</strong> ${c.texto}
            </div>
        `).join('');

        feed.innerHTML += `
            <div class="feed-post" style="border-left: 3px solid #ff3b30; padding: 15px; margin-bottom: 12px; background: #0b0f19; border-radius: 8px;">
                <strong>${t.usuario}</strong> superou um treino de <strong>${t.distancia} km</strong>
                <p><small style="color: #94a3b8;">Dificuldade: ${t.dificuldade}</small></p>
                <p style="margin: 8px 0; font-style: italic;">"${t.superacao}"</p>
                
                <div style="display: flex; gap: 10px; align-items: center; margin-top: 10px;">
                    <button class="btn-sm" onclick="curtirTreino(${t.id})">🔥 Motivar (${t.curtidas || 0})</button>
                </div>

                <div style="margin-top: 10px; border-top: 1px solid #232f45; padding-top: 8px;">
                    <div id="comments-${t.id}">${comentariosHtml}</div>
                    <div style="display: flex; gap: 5px; margin-top: 8px;">
                        <input type="text" id="input-comment-${t.id}" placeholder="Deixe um incentivo..." style="margin-bottom: 0; font-size: 12px; padding: 6px;">
                        <button class="btn-sm" onclick="adicionarComentario(${t.id})">Enviar</button>
                    </div>
                </div>
            </div>
        `;
    });

    const meta = 30;
    const porc = Math.min(Math.round((totalKm / meta) * 100), 100);
    document.getElementById('progressBar').style.width = `${porc}%`;
    document.getElementById('progressBar').innerText = `${porc}%`;
    document.getElementById('progressText').innerText = `${totalKm.toFixed(1)} km de ${meta} km concluídos`;
}

function curtirTreino(id) {
    const treino = treinosSalvos.find(t => t.id === id);
    if (treino) {
        treino.curtidas = (treino.curtidas || 0) + 1;
        localStorage.setItem('run_treinos', JSON.stringify(treinosSalvos));
        renderizarTreinos();
    }
}

function adicionarComentario(id) {
    const input = document.getElementById(`input-comment-${id}`);
    const texto = input.value.trim();
    if (!texto) return;

    const treino = treinosSalvos.find(t => t.id === id);
    if (treino) {
        if (!treino.comentarios) treino.comentarios = [];
        const autor = usuarioLogado ? usuarioLogado.username : 'Atleta';
        treino.comentarios.push({ usuario: autor, texto: texto });
        localStorage.setItem('run_treinos', JSON.stringify(treinosSalvos));
        renderizarTreinos();
    }
}

// 5. Chat da Galera (Com e.preventDefault)
document.getElementById('formChat').addEventListener('submit', (e) => {
    e.preventDefault();

    const input = document.getElementById('inputChat');
    const mensagem = input.value.trim();

    if (mensagem) {
        const novaMensagem = {
            usuario: usuarioLogado ? usuarioLogado.username : 'Anônimo',
            texto: mensagem
        };

        mensagensChat.push(novaMensagem);
        localStorage.setItem('run_chat', JSON.stringify(mensagensChat));
        
        renderizarMensagemChat(novaMensagem);
        input.value = '';
    }
});

function carregarChat() {
    const chatBox = document.getElementById('chatMessages');
    if (!chatBox) return;
    chatBox.innerHTML = '';
    mensagensChat.forEach(msg => renderizarMensagemChat(msg));
}

function renderizarMensagemChat(msg) {
    const chatBox = document.getElementById('chatMessages');
    if (!chatBox) return;

    const div = document.createElement('div');
    div.classList.add('chat-msg');
    div.innerHTML = `<strong>${msg.usuario}:</strong> ${msg.texto}`;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// 6. Galeria & Extras
function uploadFoto(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            let galeria = JSON.parse(localStorage.getItem('run_galeria')) || [];
            const item = { id: Date.now(), url: event.target.result };
            galeria.push(item);
            localStorage.setItem('run_galeria', JSON.stringify(galeria));
            carregarGaleriaSalva();
        };
        reader.readAsDataURL(file);
    }
}

function carregarGaleriaSalva() {
    const grid = document.getElementById('galeriaGrid');
    if (!grid) return;
    grid.innerHTML = '';
    let galeria = JSON.parse(localStorage.getItem('run_galeria')) || [];
    galeria.forEach(f => {
        grid.innerHTML += `
            <div class="galeria-item">
                <img src="${f.url}">
                <button class="btn-delete-foto" onclick="apagarFoto(${f.id})"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
    });
}

function apagarFoto(id) {
    let galeria = JSON.parse(localStorage.getItem('run_galeria')) || [];
    galeria = galeria.filter(f => f.id !== id);
    localStorage.setItem('run_galeria', JSON.stringify(galeria));
    carregarGaleriaSalva();
}

function toggleAddQuote() { document.getElementById('addQuoteBox').classList.toggle('hidden'); }
function salvarFrase() {
    const val = document.getElementById('inputQuote').value;
    if (val) {
        document.getElementById('quotesGrid').prepend(Object.assign(document.createElement('div'), {
            className: 'quote-card',
            innerHTML: `<i class="fa-solid fa-quote-left"></i><p>${val}</p>`
        }));
        document.getElementById('inputQuote').value = '';
        toggleAddQuote();
    }
}

function atualizarCronometro() {
    if (eventosCalendario.length === 0) return;
    const proximo = new Date(eventosCalendario[0].data).getTime();
    const agora = new Date().getTime();
    const diff = proximo - agora;

    if (diff > 0) {
        document.getElementById('days').innerText = Math.floor(diff / (1000 * 60 * 60 * 24));
        document.getElementById('hours').innerText = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        document.getElementById('minutes').innerText = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        document.getElementById('seconds').innerText = Math.floor((diff % (1000 * 60)) / 1000);
    }
}