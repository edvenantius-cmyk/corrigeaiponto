// ⚠️ IMPORTAÇÕES FIREBASE
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getFirestore, collection, doc, updateDoc, deleteDoc, onSnapshot, query, orderBy } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

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

const SENHA_CORRETA = 'diuvitae#182';
let todasJustificativas = [];
let unsubscribe = null;

// Login
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const senha = document.getElementById('senha').value;
    const erro = document.getElementById('loginError');
    
    if (senha === SENHA_CORRETA) {
        sessionStorage.setItem('rh_autenticado', 'true');
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminPanel').classList.add('show');
        iniciarSincronizacao();
    } else {
        erro.textContent = '❌ Senha incorreta. Tente novamente.';
        erro.classList.add('show');
        document.getElementById('senha').value = '';
        document.getElementById('senha').focus();
        
        setTimeout(() => {
            erro.classList.remove('show');
        }, 3000);
    }
});

// Verificar autenticação
window.addEventListener('load', () => {
    if (sessionStorage.getItem('rh_autenticado') === 'true') {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminPanel').classList.add('show');
        iniciarSincronizacao();
    }
});

// Logout
function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        if (unsubscribe) unsubscribe();
        sessionStorage.removeItem('rh_autenticado');
        location.reload();
    }
}
window.logout = logout;

// Iniciar sincronização
function iniciarSincronizacao() {
    const q = query(collection(db, 'justificativas_ponto'), orderBy('dataEnvio', 'desc'));
    
    unsubscribe = onSnapshot(q, (snapshot) => {
        todasJustificativas = [];
        snapshot.forEach((docSnap) => {
            todasJustificativas.push({
                id: docSnap.id,
                ...docSnap.data()
            });
        });
        
        atualizarEstatisticas();
        renderizarTabela(todasJustificativas);
    }, (error) => {
        console.error('Erro ao carregar justificativas:', error);
        alert('Erro ao carregar dados: ' + error.message);
    });
}

// Atualizar estatísticas
function atualizarEstatisticas() {
    const total = todasJustificativas.length;
    const pendentes = todasJustificativas.filter(j => j.status === 'pendente').length;
    const aprovados = todasJustificativas.filter(j => j.status === 'aprovado').length;
    const rejeitados = todasJustificativas.filter(j => j.status === 'rejeitado').length;
    
    document.getElementById('statsContainer').innerHTML = `
        <div class="stat-card green">
            <div class="number">${total}</div>
            <div class="label">Total de Justificativas</div>
        </div>
        <div class="stat-card orange">
            <div class="number">${pendentes}</div>
            <div class="label">Pendentes</div>
        </div>
        <div class="stat-card blue">
            <div class="number">${aprovados}</div>
            <div class="label">Aprovados</div>
        </div>
        <div class="stat-card red">
            <div class="number">${rejeitados}</div>
            <div class="label">Rejeitados</div>
        </div>
    `;
}

// Renderizar tabela
function renderizarTabela(justificativas) {
    const tbody = document.getElementById('tabelaJustificativas');
    
    if (justificativas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6">
                    <div class="empty-state">
                        <p style="font-size: 18px; margin-bottom: 10px;">📭 Nenhuma justificativa encontrada</p>
                        <p style="font-size: 14px;">As justificativas enviadas pelos colaboradores aparecerão aqui.</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = justificativas.map(just => {
        const data = new Date(just.data).toLocaleDateString('pt-BR');
        
        const statusClass = just.status || 'pendente';
        const statusLabel = {
            'pendente': 'Pendente',
            'aprovado': 'Aprovado',
            'rejeitado': 'Rejeitado'
        }[statusClass];
        
        const tipoClass = just.tipo;
        const tipoLabel = {
            'entrada': 'Entrada',
            'saida_almoco': 'Saída Almoço',
            'volta_almoco': 'Volta Almoço',
            'saida': 'Saída'
        }[just.tipo];
        
        return `
            <tr>
                <td><strong>${just.nome}</strong></td>
                <td>${data}</td>
                <td><strong>${just.horario}</strong></td>
                <td><span class="badge ${tipoClass}">${tipoLabel}</span></td>
                <td><span class="badge ${statusClass}">${statusLabel}</span></td>
                <td style="white-space: nowrap;">
                    <button class="btn-action btn-view" onclick='verDetalhes("${just.id}")' title="Ver detalhes">
                        👁️
                    </button>
                    <button class="btn-action btn-copy" onclick='copiarDados("${just.id}")' title="Copiar horário e motivo">
                        📋
                    </button>
                    ${statusClass === 'pendente' ? `
                        <button class="btn-action btn-approve" onclick='aprovar("${just.id}")' title="Aprovar">
                            ✅
                        </button>
                        <button class="btn-action btn-reject" onclick='rejeitar("${just.id}")' title="Rejeitar">
                            ❌
                        </button>
                    ` : ''}
                    <button class="btn-action btn-delete" onclick='excluir("${just.id}")' title="Excluir">
                        🗑️
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Filtrar justificativas
function filtrarJustificativas() {
    const status = document.getElementById('filtroStatus').value;
    const tipo = document.getElementById('filtroTipo').value;
    const busca = document.getElementById('buscaNome').value.toLowerCase();
    
    let filtradas = todasJustificativas;
    
    if (status) filtradas = filtradas.filter(j => (j.status || 'pendente') === status);
    if (tipo) filtradas = filtradas.filter(j => j.tipo === tipo);
    if (busca) filtradas = filtradas.filter(j => j.nome.toLowerCase().includes(busca));
    
    renderizarTabela(filtradas);
}
window.filtrarJustificativas = filtrarJustificativas;

// Ver detalhes
function verDetalhes(id) {
    const just = todasJustificativas.find(j => j.id === id);
    if (!just) return;
    
    const data = new Date(just.data).toLocaleDateString('pt-BR');
    const dataEnvio = just.dataEnvio ? 
        new Date(just.dataEnvio.toDate()).toLocaleString('pt-BR') : 
        'Aguardando...';
    
    const tipoLabel = {
        'entrada': 'Entrada',
        'saida_almoco': 'Saída para Almoço',
        'volta_almoco': 'Volta do Almoço',
        'saida': 'Saída'
    }[just.tipo];
    
    const statusLabel = {
        'pendente': 'Pendente',
        'aprovado': 'Aprovado',
        'rejeitado': 'Rejeitado'
    }[just.status || 'pendente'];
    
    document.getElementById('modalBody').innerHTML = `
        <div class="info-grid">
            <div class="info-item">
                <div class="label">Colaborador</div>
                <div class="value">${just.nome}</div>
            </div>
            <div class="info-item">
                <div class="label">Data</div>
                <div class="value">${data}</div>
            </div>
            <div class="info-item">
                <div class="label">Horário</div>
                <div class="value">${just.horario}</div>
            </div>
            <div class="info-item">
                <div class="label">Tipo de Marcação</div>
                <div class="value">${tipoLabel}</div>
            </div>
            <div class="info-item">
                <div class="label">Status</div>
                <div class="value">${statusLabel}</div>
            </div>
            <div class="info-item">
                <div class="label">Data do Envio</div>
                <div class="value">${dataEnvio}</div>
            </div>
        </div>
        
        <h3 style="margin-top: 20px; margin-bottom: 10px; color: #2E7D32;">📝 Motivo/Justificativa</h3>
        <div style="background: #F9FAFB; padding: 15px; border-radius: 8px; border-left: 4px solid #2E7D32;">
            ${just.motivo}
        </div>
        
        <h3 style="margin-top: 20px; margin-bottom: 10px; color: #2E7D32;">📋 Copiar para Outro Sistema</h3>
        
        <div class="copy-box">
            <button class="copy-btn" onclick='copiarTexto("${just.horario}")'>📋 Copiar</button>
            <strong>Horário:</strong><br>
            ${just.horario}
        </div>
        
        <div class="copy-box">
            <button class="copy-btn" onclick='copiarTexto("${just.motivo.replace(/"/g, '&quot;').replace(/\n/g, ' ')}")'>📋 Copiar</button>
            <strong>Motivo:</strong><br>
            ${just.motivo}
        </div>
        
        <div style="margin-top: 20px; display: flex; gap: 10px;">
            ${just.status === 'pendente' ? `
                <button class="btn-action btn-approve" onclick='aprovar("${just.id}")' 
                        style="flex: 1; padding: 12px;">
                    ✅ Aprovar
                </button>
                <button class="btn-action btn-reject" onclick='rejeitar("${just.id}")' 
                        style="flex: 1; padding: 12px;">
                    ❌ Rejeitar
                </button>
            ` : ''}
            <button class="btn-action btn-delete" onclick='excluir("${just.id}")' 
                    style="flex: 1; padding: 12px;">
                🗑️ Excluir
            </button>
        </div>
    `;
    
    document.getElementById('modalDetalhes').classList.add('show');
}
window.verDetalhes = verDetalhes;

// Fechar modal
function fecharModal() {
    document.getElementById('modalDetalhes').classList.remove('show');
}
window.fecharModal = fecharModal;

document.getElementById('modalDetalhes').addEventListener('click', function(e) {
    if (e.target === this) fecharModal();
});

// Copiar texto
function copiarTexto(texto) {
    navigator.clipboard.writeText(texto).then(() => {
        mostrarToast('✅ Copiado!');
    }).catch(err => {
        console.error('Erro ao copiar:', err);
        mostrarToast('❌ Erro ao copiar');
    });
}
window.copiarTexto = copiarTexto;

// Copiar dados (horário + motivo)
function copiarDados(id) {
    const just = todasJustificativas.find(j => j.id === id);
    if (!just) return;
    
    const texto = `Horário: ${just.horario}\n\nMotivo: ${just.motivo}`;
    
    navigator.clipboard.writeText(texto).then(() => {
        mostrarToast('✅ Horário e motivo copiados!');
    }).catch(err => {
        console.error('Erro ao copiar:', err);
        mostrarToast('❌ Erro ao copiar');
    });
}
window.copiarDados = copiarDados;

// Mostrar toast
function mostrarToast(mensagem) {
    const toast = document.getElementById('toast');
    toast.textContent = mensagem;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

// Aprovar
async function aprovar(id) {
    const just = todasJustificativas.find(j => j.id === id);
    if (!just) return;
    
    if (confirm(`Aprovar a justificativa de ${just.nome}?`)) {
        try {
            await updateDoc(doc(db, 'justificativas_ponto', id), {
                status: 'aprovado',
                dataAprovacao: new Date()
            });
            fecharModal();
            mostrarToast('✅ Justificativa aprovada!');
        } catch (error) {
            console.error('Erro ao aprovar:', error);
            alert('Erro ao aprovar: ' + error.message);
        }
    }
}
window.aprovar = aprovar;

// Rejeitar
async function rejeitar(id) {
    const just = todasJustificativas.find(j => j.id === id);
    if (!just) return;
    
    if (confirm(`Rejeitar a justificativa de ${just.nome}?`)) {
        try {
            await updateDoc(doc(db, 'justificativas_ponto', id), {
                status: 'rejeitado',
                dataRejeicao: new Date()
            });
            fecharModal();
            mostrarToast('❌ Justificativa rejeitada!');
        } catch (error) {
            console.error('Erro ao rejeitar:', error);
            alert('Erro ao rejeitar: ' + error.message);
        }
    }
}
window.rejeitar = rejeitar;

// Excluir
async function excluir(id) {
    const just = todasJustificativas.find(j => j.id === id);
    if (!just) return;
    
    if (confirm(`⚠️ ATENÇÃO\n\nExcluir a justificativa de ${just.nome}?\n\nEsta ação não pode ser desfeita!`)) {
        try {
            await deleteDoc(doc(db, 'justificativas_ponto', id));
            fecharModal();
            mostrarToast('🗑️ Justificativa excluída!');
        } catch (error) {
            console.error('Erro ao excluir:', error);
            alert('Erro ao excluir: ' + error.message);
        }
    }
}
window.excluir = excluir;

// Exportar PDF
function exportarPDF() {
    if (todasJustificativas.length === 0) {
        alert('Não há justificativas para exportar.');
        return;
    }
    
    // Filtrar aprovados do mês atual
    const mesAtual = new Date().getMonth();
    const anoAtual = new Date().getFullYear();
    
    const aprovadosMes = todasJustificativas.filter(j => {
        if (j.status !== 'aprovado') return false;
        const dataJust = new Date(j.data);
        return dataJust.getMonth() === mesAtual && dataJust.getFullYear() === anoAtual;
    });
    
    if (aprovadosMes.length === 0) {
        alert('Não há justificativas aprovadas neste mês.');
        return;
    }
    
    // Criar PDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(18);
    doc.setTextColor(46, 125, 50);
    doc.text('Justificativas de Ponto - Diu Vitae', 105, 20, { align: 'center' });
    
    // Mês/Ano
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Mês: ${meses[mesAtual]}/${anoAtual}`, 105, 30, { align: 'center' });
    doc.text(`Total de justificativas aprovadas: ${aprovadosMes.length}`, 105, 37, { align: 'center' });
    
    // Linha
    doc.setDrawColor(46, 125, 50);
    doc.line(20, 42, 190, 42);
    
    let y = 50;
    
    // Ordenar por data
    aprovadosMes.sort((a, b) => new Date(a.data) - new Date(b.data));
    
    // Listar justificativas
    aprovadosMes.forEach((just, index) => {
        // Verificar se precisa nova página
        if (y > 270) {
            doc.addPage();
            y = 20;
        }
        
        const data = new Date(just.data).toLocaleDateString('pt-BR');
        const tipoLabel = {
            'entrada': 'Entrada',
            'saida_almoco': 'Saída Almoço',
            'volta_almoco': 'Volta Almoço',
            'saida': 'Saída'
        }[just.tipo];
        
        // Nome e data
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text(`${index + 1}. ${just.nome}`, 20, y);
        
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        y += 6;
        doc.text(`Data: ${data}  |  Horário: ${just.horario}  |  Tipo: ${tipoLabel}`, 20, y);
        
        y += 5;
        doc.text(`Motivo: ${just.motivo.substring(0, 80)}${just.motivo.length > 80 ? '...' : ''}`, 20, y);
        
        y += 10;
        
        // Linha separadora
        doc.setDrawColor(200, 200, 200);
        doc.line(20, y, 190, y);
        y += 8;
    });
    
    // Rodapé
    const totalPaginas = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPaginas; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Página ${i} de ${totalPaginas}`, 105, 290, { align: 'center' });
        doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 105, 295, { align: 'center' });
    }
    
    // Salvar
    doc.save(`Justificativas_Ponto_${meses[mesAtual]}_${anoAtual}.pdf`);
}
window.exportarPDF = exportarPDF;
