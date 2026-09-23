const actionButtons = document.querySelectorAll('[data-action]');
const dialog = document.querySelector('#navigation-dialog');
const dialogMessage = document.querySelector('#navigation-message');
const menuButtons = document.querySelectorAll('[data-section]');

function showUnavailable(message) {
  dialogMessage.textContent = message;
  dialog.showModal();
}

actionButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const action = button.dataset.action;

    const messages = {
      'editar-venda': 'A edição de venda será liberada em uma próxima etapa.',
      'nova-venda': 'A criação de nova venda será implementada em breve.',
      andamento: 'A área de vendas em andamento está em desenvolvimento.',
      abertas: 'A consulta de vendas abertas será exibida em breve.',
      concluidas: 'A área de vendas concluídas está em desenvolvimento.'
    };

    showUnavailable(messages[action] || 'Essa funcionalidade ainda não está disponível nesta versão.');
  });
});

menuButtons.forEach((button) => {
  button.addEventListener('click', () => {
    if (button.dataset.section === 'Clientes') {
      return;
    }

    showUnavailable(`A seção “${button.dataset.section}” ainda não está disponível no sistema.`);
  });
});
