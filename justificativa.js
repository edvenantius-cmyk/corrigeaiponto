// ⚠️ IMPORTAÇÕES FIREBASE
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getFirestore, collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// ⚠️ CONFIGURAÇÃO DO FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyDCU4gpAd-dWCFYtgIwk_qylXWy8mvVgXk",
    authDomain: "corrigeaiponto.firebaseapp.com",
    projectId: "corrigeaiponto",
    storageBucket: "corrigeaiponto.firebasestorage.app",
    messagingSenderId: "969231364468",
    appId: "1:969231364468:web:e32b66e957a192caff7c21"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Data máxima = hoje
const hoje = new Date().toISOString().split('T')[0];
document.getElementById('data').setAttribute('max', hoje);

// ── MÁSCARA CPF ──────────────────────────────────────
document.getElementById('cpf').addEventListener('input', function(e) {
    let v = e.target.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    else if (v.length > 3) v = v.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    e.target.value = v;
});

// ── MARCAÇÕES DINÂMICAS ──────────────────────────────
const TIPOS = [
    { value: '', label: 'Selecione o tipo' },
    { value: 'entrada', label: 'Entrada' },
    { value: 'saida_almoco', label: 'Saída para Almoço' },
    { value: 'volta_almoco', label: 'Volta do Almoço' },
    { value: 'intervalo', label: 'Intervalo (entrada e saída)' },
    { value: 'saida', label: 'Saída' },
];

// Tipos que têm dois horários (entrada + saída do intervalo)
const TIPO_DUPLO = ['intervalo'];

let contadorMarcacao = 0;

function criarMarcacaoCard(numero) {
    contadorMarcacao++;
    const id = contadorMarcacao;

    const card = document.createElement('div');
    card.className = 'marcacao-card';
    card.dataset.id = id;

    const opcoesHTML = TIPOS.map(t =>
        `<option value="${t.value}">${t.label}</option>`
    ).join('');

    card.innerHTML = `
        <div class="marcacao-header">
            <span class="marcacao-num">📌 Marcação ${numero}</span>
            <button type="button" class="btn-remover-marcacao" onclick="removerMarcacao(this)">✕ Remover</button>
        </div>
        <div class="marcacao-row">
            <div class="marcacao-field" style="grid-column: 1 / -1;">
                <label>Tipo de Marcação <span class="required">*</span></label>
                <select class="campo-tipo" required>
                    ${opcoesHTML}
                </select>
            </div>
        </div>
        <!-- Horário simples (maioria dos tipos) -->
        <div class="horario-simples">
            <label style="font-size:13px; color:#374151; font-weight:600; margin-bottom:6px; display:block;">
                Horário que Deveria Ter Batido <span class="required">*</span>
            </label>
            <input type="time" class="campo-horario">
        </div>
        <!-- Horários duplos (intervalo) -->
        <div class="horario-intervalo-group">
            <div>
                <label style="font-size:13px; color:#374151; font-weight:600; margin-bottom:6px; display:block;">
                    Horário de Saída <span class="required">*</span>
                </label>
                <input type="time" class="campo-horario-saida">
            </div>
            <div>
                <label style="font-size:13px; color:#374151; font-weight:600; margin-bottom:6px; display:block;">
                    Horário de Retorno <span class="required">*</span>
                </label>
                <input type="time" class="campo-horario-retorno">
            </div>
        </div>
    `;

    // Listener para mostrar/esconder campos de horário conforme tipo
    const selectTipo = card.querySelector('.campo-tipo');
    const horarioSimples = card.querySelector('.horario-simples');
    const horarioDuplo = card.querySelector('.horario-intervalo-group');
    const campoHorario = card.querySelector('.campo-horario');
    const campoSaida = card.querySelector('.campo-horario-saida');
    const campoRetorno = card.querySelector('.campo-horario-retorno');

    selectTipo.addEventListener('change', function() {
        const isDuplo = TIPO_DUPLO.includes(this.value);
        if (isDuplo) {
            horarioSimples.classList.add('hide');
            horarioDuplo.classList.add('show');
            campoHorario.required = false;
            campoSaida.required = true;
            campoRetorno.required = true;
        } else {
            horarioSimples.classList.remove('hide');
            horarioDuplo.classList.remove('show');
            campoHorario.required = !!this.value;
            campoSaida.required = false;
            campoRetorno.required = false;
        }
    });

    return card;
}

function renumerarMarcacoes() {
    const cards = document.querySelectorAll('.marcacao-card');
    cards.forEach((card, i) => {
        card.querySelector('.marcacao-num').textContent = `📌 Marcação ${i + 1}`;
        // Exibe botão remover apenas se houver mais de um
        card.querySelector('.btn-remover-marcacao').style.display = cards.length > 1 ? '' : 'none';
    });
}

function adicionarMarcacao() {
    const lista = document.getElementById('listaMarcacoes');
    const numero = lista.querySelectorAll('.marcacao-card').length + 1;
    lista.appendChild(criarMarcacaoCard(numero));
    renumerarMarcacoes();
}

window.removerMarcacao = function(btn) {
    btn.closest('.marcacao-card').remove();
    renumerarMarcacoes();
};

document.getElementById('btnAddMarcacao').addEventListener('click', adicionarMarcacao);

// Primeira marcação ao carregar
adicionarMarcacao();

// ── ALERTA ────────────────────────────────────────────
function showAlert(message, type) {
    const alert = document.getElementById('alert');
    alert.className = `alert alert-${type} show`;
    alert.textContent = message;
    setTimeout(() => { alert.classList.remove('show'); }, 5000);
}

// ── SUBMISSÃO ─────────────────────────────────────────
document.getElementById('justificativaForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const nome  = document.getElementById('nome').value.trim();
    const cpf   = document.getElementById('cpf').value.trim();
    const data  = document.getElementById('data').value;
    const motivo = document.getElementById('motivo').value.trim();

    // Validar CPF básico
    const cpfLimpo = cpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) {
        showAlert('Por favor, informe um CPF válido com 11 dígitos.', 'error');
        return;
    }

    if (!nome || !data || !motivo) {
        showAlert('Por favor, preencha todos os campos obrigatórios.', 'error');
        return;
    }

    // Validar data
    const dataEscolhida = new Date(data + 'T00:00:00');
    const dataHoje = new Date();
    dataHoje.setHours(0, 0, 0, 0);
    if (dataEscolhida > dataHoje) {
        showAlert('A data não pode ser futura!', 'error');
        return;
    }

    // Coletar marcações
    const cards = document.querySelectorAll('.marcacao-card');
    const marcacoes = [];

    for (const card of cards) {
        const tipo = card.querySelector('.campo-tipo').value;
        if (!tipo) {
            showAlert('Selecione o tipo de marcação em todas as entradas.', 'error');
            return;
        }

        if (TIPO_DUPLO.includes(tipo)) {
            const saida   = card.querySelector('.campo-horario-saida').value;
            const retorno = card.querySelector('.campo-horario-retorno').value;
            if (!saida || !retorno) {
                showAlert('Informe os horários de saída e retorno do intervalo.', 'error');
                return;
            }
            marcacoes.push({ tipo, horarioSaida: saida, horarioRetorno: retorno });
        } else {
            const horario = card.querySelector('.campo-horario').value;
            if (!horario) {
                showAlert('Informe o horário de todas as marcações.', 'error');
                return;
            }
            marcacoes.push({ tipo, horario });
        }
    }

    if (marcacoes.length === 0) {
        showAlert('Adicione ao menos uma marcação.', 'error');
        return;
    }

    // Montar objeto para Firestore
    const dados = {
        nome,
        cpf,
        data,
        marcacoes,
        // Compat retroativa: preenche horario/tipo com a primeira marcação
        horario: marcacoes[0].horario || `${marcacoes[0].horarioSaida} - ${marcacoes[0].horarioRetorno}`,
        tipo: marcacoes[0].tipo,
        motivo,
        dataEnvio: serverTimestamp(),
        status: 'pendente'
    };

    // Loading
    document.getElementById('justificativaForm').style.display = 'none';
    document.getElementById('loading').classList.add('show');

    try {
        await addDoc(collection(db, 'justificativas_ponto'), dados);
        document.getElementById('loading').classList.remove('show');
        document.getElementById('successMessage').style.display = 'block';
    } catch (error) {
        console.error('Erro ao enviar:', error);
        document.getElementById('loading').classList.remove('show');
        document.getElementById('justificativaForm').style.display = 'block';
        showAlert('Erro ao enviar justificativa: ' + error.message, 'error');
    }
});
