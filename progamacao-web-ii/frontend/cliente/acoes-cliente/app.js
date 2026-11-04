const actionButtons = document.querySelectorAll('[data-action]');
const dialog = document.querySelector('#navigation-dialog');
const dialogMessage = document.querySelector('#navigation-message');

const routes = {
    cadastrar: '../cadastrar-cliente/index.html',
    pesquisa: '../pesquisar-cliente/index.html',
    editar: '../listagem-clientes/index.html',
    excluir: '../listagem-clientes/index.html'
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

        showUnavailable('Essa funcionalidade ainda não está disponível nesta versão.');
    });
});