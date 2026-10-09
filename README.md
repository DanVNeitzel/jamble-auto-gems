# 💎 Jamble Auto Gems — v2.0.1

🛠️ **Atualização de manutenção, correção de bugs e melhorias de estabilidade.**

Esta versão corrige o registro duplicado de eventos no histórico e aprimora o encerramento automático da coleta quando o limite diário de recompensas é atingido.

## 🐛 Correções

- **Histórico duplicado:** corrigido o problema que registrava repetidamente a mensagem "Próximo dia".
- **Encerramento automático:** a extensão agora desativa a coleta ao detectar o limite diário de recompensas.
- **Notificações repetidas:** implementado controle para evitar múltiplos alertas sobre o mesmo evento.
- **Controle de estados:** aprimorada a persistência do estado de encerramento para evitar novas tentativas de coleta após o limite.

## ✨ Melhorias

- 💎 Registro único de limite diário por aba.
- 🛑 Desativação automática da coleta ao atingir o limite.
- 🔒 Prevenção de novas tentativas após o encerramento.
- 📊 Status mais claro: "Limite diário atingido — coleta desativada".
- 🔘 Reativação manual pelo painel da extensão.
- 🖥️ Melhor organização dos eventos no histórico.

## 📦 Como atualizar

1. Baixe o arquivo `jamble-auto-gems-v2.0.1.zip`.
2. Extraia o conteúdo em uma pasta.
3. Acesse `chrome://extensions`.
4. Remova ou desative a versão anterior.
5. Ative o **Modo do desenvolvedor**.
6. Clique em **Carregar sem compactação**.
7. Selecione a pasta extraída.
8. Atualize a página da Jamble.

## ⚠️ Observações

- Ao detectar o limite diário em uma live, a coleta automática é desativada globalmente, incluindo outras lives monitoradas.
- A extensão não garante o recebimento das gemas; os registros de clique representam tentativas de reivindicação.
- Projeto independente, sem vínculo oficial com a Jamble. Respeite os termos de uso da plataforma.

## 👨‍💻 Desenvolvedor

**Daniel Neitzel**

🌐 https://danielneitzel.dev

---

⭐ Gostou do projeto? Deixe uma estrela no repositório para apoiar o desenvolvimento!
