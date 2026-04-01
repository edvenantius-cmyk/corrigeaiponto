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

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Definir data máxima como hoje
const hoje = new Date().toISOString().split('T')[0];
document.getElementById('data').setAttribute('max', hoje);

// Mostrar alerta
function showAlert(message, type) {
    const alert = document.getElementById('alert');
    alert.className = `alert alert-${type} show`;
    alert.textContent = message;
    
    setTimeout(() => {
        alert.classList.remove('show');
    }, 5000);
}

// Enviar formulário
document.getElementById('justificativaForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Coletar dados
    const dados = {
        nome: document.getElementById('nome').value.trim(),
        data: document.getElementById('data').value,
        horario: document.getElementById('horario').value,
        tipo: document.getElementById('tipo').value,
        motivo: document.getElementById('motivo').value.trim(),
        
        // Metadados
        dataEnvio: serverTimestamp(),
        status: 'pendente'
    };
    
    // Validações
    if (!dados.nome || !dados.data || !dados.horario || !dados.tipo || !dados.motivo) {
        showAlert('Por favor, preencha todos os campos obrigatórios.', 'error');
        return;
    }
    
    // Validar se data não é futura
    const dataEscolhida = new Date(dados.data + 'T00:00:00');
    const dataHoje = new Date();
    dataHoje.setHours(0, 0, 0, 0);
    
    if (dataEscolhida > dataHoje) {
        showAlert('A data não pode ser futura!', 'error');
        return;
    }
    
    // Mostrar loading
    document.getElementById('justificativaForm').style.display = 'none';
    document.getElementById('loading').classList.add('show');
    
    try {
        // Salvar no Firestore
        await addDoc(collection(db, 'justificativas_ponto'), dados);
        
        // Mostrar sucesso
        document.getElementById('loading').classList.remove('show');
        document.getElementById('successMessage').style.display = 'block';
        
    } catch (error) {
        console.error('Erro ao enviar:', error);
        document.getElementById('loading').classList.remove('show');
        document.getElementById('justificativaForm').style.display = 'block';
        showAlert('Erro ao enviar justificativa: ' + error.message, 'error');
    }
});
