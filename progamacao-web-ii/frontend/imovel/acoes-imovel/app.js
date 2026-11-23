const actionButtons = document.querySelectorAll('[data-action]');
const dialog = document.querySelector('#navigation-dialog');
const dialogMessage = document.querySelector('#navigation-message');

const routes = {
    cadastrar: '../cadastrar-imovel/index.html',
    pesquisa: '../pesquisar-imovel/index.html',
    editar: '../listagem-imovel/index.html',
    excluir: '../listagem-imovel/index.html'
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