# ⏰ Sistema de Justificativa de Ponto - Diu Vitae

## 🎯 Sobre o Sistema

Sistema para colaboradores justificarem pontos não batidos e RH aprovar/rejeitar. Com cores da marca Diu Vitae e funcionalidade de copiar dados para colar em outros sistemas.

---

## 📱 PARA COLABORADORES

### Como Enviar Justificativa:

1. Acesse: `seu-link.vercel.app/index.html`
2. Preencha:
   - ✅ Seu nome completo
   - ✅ Data que esqueceu de bater
   - ✅ Horário que deveria ter batido
   - ✅ Tipo (Entrada/Saída Almoço/Volta Almoço/Saída)
   - ✅ Motivo/Justificativa
3. Clique "Enviar Justificativa"
4. Pronto! RH receberá automaticamente

### Validações:
- ✅ Data não pode ser futura
- ✅ Todos os campos obrigatórios
- ✅ Motivo deve ser explicativo

---

## 🔐 PARA RH (PAINEL ADMINISTRATIVO)

### Acesso:
**URL:** `seu-link.vercel.app/admin.html`  
**Senha:** `diuvitae#182`

### Funcionalidades:

**Estatísticas:**
- Total de justificativas
- Pendentes
- Aprovados
- Rejeitados

**Ações:**
- 👁️ **Ver detalhes** completos
- 📋 **Copiar** horário e motivo (para colar em outro sistema)
- ✅ **Aprovar** justificativa
- ❌ **Rejeitar** justificativa
- 🗑️ **Excluir** justificativa
- 📄 **Exportar PDF** do mês

**Filtros:**
- Por status (pendente/aprovado/rejeitado)
- Por tipo (entrada/saída/almoço)
- Por nome do colaborador

---

## 📋 COPIAR PARA OUTRO SISTEMA

**Funcionalidade especial!**

O RH pode copiar horário e motivo separadamente para colar em outro sistema de ponto:

### Opção 1: Botão rápido
- Na tabela, clique no botão **📋** ao lado da justificativa
- Copia **horário + motivo** juntos

### Opção 2: Copiar separado
- Clique em **👁️ Ver** para abrir detalhes
- Botão **"📋 Copiar"** ao lado do horário
- Botão **"📋 Copiar"** ao lado do motivo
- Copie cada um separadamente

**Exemplo do que é copiado:**
```
Horário: 08:30

Motivo: Esqueci de bater o ponto na entrada devido a correria do início do expediente.
```

---

## 📄 EXPORTAR PDF DO MÊS

**Como funciona:**
1. Clique no botão **"📄 Exportar PDF do Mês"**
2. Sistema filtra **apenas aprovados** do mês atual
3. Gera PDF com:
   - Título "Justificativas de Ponto - Diu Vitae"
   - Mês e ano
   - Total de justificativas
   - Lista com: nome, data, horário, tipo, motivo
   - Rodapé com data de geração

**Nome do arquivo:**
```
Justificativas_Ponto_Março_2026.pdf
```

**O que é exportado:**
- ✅ Somente justificativas **aprovadas**
- ✅ Somente do **mês atual**
- ✅ Ordenadas por data
- ✅ Formatação profissional

---

## 🔄 FLUXO COMPLETO:

```
COLABORADOR
    ↓
Esqueceu de bater ponto
    ↓
Preenche formulário
    ↓
FIREBASE (salva automaticamente)
    ↓
RH vê no painel
    ↓
Status: PENDENTE (laranja)
    ↓
RH ANALISA
    ↓
Opções:
  - ✅ Aprovar (verde)
  - ❌ Rejeitar (vermelho)
  - 📋 Copiar dados (para outro sistema)
    ↓
APROVADO?
    ↓
Sim → Exportar no PDF do mês
Não → Fica registrado como rejeitado
```

---

## 🎨 CORES E BADGES:

**Status:**
- 🟨 Pendente (amarelo)
- 🟩 Aprovado (verde)
- 🟥 Rejeitado (vermelho)

**Tipos:**
- 🔵 Entrada (azul)
- 🟡 Saída Almoço (amarelo)
- 🟣 Volta Almoço (roxo)
- 🔴 Saída (rosa)

---

## ⚙️ CONFIGURAÇÃO

**Já está tudo configurado!**
- ✅ Firebase conectado
- ✅ Cores Diu Vitae aplicadas
- ✅ Senha definida: `diuvitae#182`
- ✅ Exportação PDF pronta
- ✅ Função copiar ativada

---

## 🔒 ALTERAR SENHA

**Para trocar a senha:**
1. Abra `admin.js`
2. Linha ~21: `const SENHA_CORRETA = 'diuvitae#182';`
3. Mude para sua senha
4. Faça deploy novamente

---

## 🔐 REGRAS FIRESTORE

**IMPORTANTE!** Configure as regras de segurança.

**Acesse:**
1. https://console.firebase.google.com
2. Projeto: "corrigeaiponto"
3. Firestore Database → Regras
4. Cole este código:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Coleção: justificativas_ponto
    match /justificativas_ponto/{document=**} {
      // Leitura: Liberado
      allow read: if true;
      
      // Criação: Liberado (colaboradores enviam)
      allow create: if true;
      
      // Atualização: Liberado (RH aprova/rejeita)
      allow update: if true;
      
      // Exclusão: Liberado (RH exclui)
      allow delete: if true;
    }
  }
}
```

5. Clique "Publicar"

---

## 📊 ESTRUTURA DOS ARQUIVOS:

```
justificativa-ponto/
├── index.html           → Formulário colaboradores
├── justificativa.js     → Lógica do formulário
├── admin.html           → Painel RH
├── admin.js             → Lógica admin
├── README.md            → Esta documentação
└── REGRAS-FIRESTORE.md  → Regras de segurança
```

---

## 🚀 COMO HOSPEDAR:

**Vercel (Recomendado):**
1. https://vercel.com
2. Conecte ao GitHub OU arraste pasta
3. Deploy!
4. Copie o link

---

## 💡 DICAS DE USO:

**Para RH:**
1. Aprove justificativas válidas
2. Use botão **📋 Copiar** para colar no sistema de ponto
3. No final do mês, **exporte PDF** para arquivo
4. Guarde PDFs mensais como backup

**Para Colaboradores:**
1. Envie justificativa assim que perceber
2. Seja claro no motivo
3. Não invente desculpas falsas

---

## ❓ PERGUNTAS FREQUENTES:

**P: Colaborador pode editar depois de enviar?**  
R: Não. Se errou, envie outra justificativa.

**P: Posso aprovar em lote?**  
R: Não no momento. Cada uma deve ser analisada.

**P: O PDF inclui rejeitados?**  
R: Não! Só aprovados do mês.

**P: Posso copiar vários de uma vez?**  
R: Não. Copie um por vez usando o botão 📋.

**P: Como sei que colaborador enviou?**  
R: Estatísticas mostram "Pendentes" em tempo real.

---

## ✅ CHECKLIST DE IMPLANTAÇÃO:

- [ ] Hospedar no Vercel
- [ ] Configurar regras Firestore
- [ ] Testar envio de justificativa
- [ ] Testar login admin (senha: diuvitae#182)
- [ ] Testar aprovar/rejeitar
- [ ] Testar botão copiar
- [ ] Testar exportar PDF
- [ ] Compartilhar link com colaboradores
- [ ] Salvar link admin nos favoritos

---

## 🆘 SUPORTE:

**Justificativa não aparece:**
- Aguarde 2-3 segundos
- Atualize página (F12)
- Verifique filtros

**Botão copiar não funciona:**
- Use navegador moderno (Chrome recomendado)
- Permita acesso à área de transferência

**PDF vazio:**
- Verifique se há aprovados no mês
- Aprove ao menos uma justificativa

---

**PRONTO PARA USO! ⏰✨**

Qualquer dúvida, consulte esta documentação.

---

**Desenvolvido com ⏰ para Diu Vitae**
