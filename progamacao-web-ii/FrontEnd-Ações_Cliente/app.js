const actionButtons = document.querySelectorAll('[data-action]');
const dialog = document.querySelector('#navigation-dialog');
const dialogMessage = document.querySelector('#navigation-message');
const menuButtons = document.querySelectorAll('[data-section]');

const routes = {
  cadastrar: './Cadastrar_Cliente/index.html',
  pesquisa: '../Front-Pesquisar_Cliente/index.html',
  editar: '../Front-Editar_Cliente/index.html',
};

function showUnavailable(message) {
  dialogMessage.textContent = message;
  dialog.showModal();
}

actionButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const action = button.dataset.action;
    const target = routes[action];

    if (target) {
      window.location.href = target;
      return;
    }

    if (action === 'excluir') {
      showUnavailable('A exclusão do cliente deve ser realizada na tela de pesquisa ou edição do cadastro selecionado.');
      return;
    }

    showUnavailable('Essa funcionalidade ainda não está disponível nesta versão.');
  });
});

menuButtons.forEach((button) => {
  button.addEventListener('click', () => {
    if (button.dataset.section === 'Clientes') {
      return;
    }

    showUnavailable(`A seção “${button.dataset.section}” ainda não está disponível no módulo de clientes.`);
  });
});
