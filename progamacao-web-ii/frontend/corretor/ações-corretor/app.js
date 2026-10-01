const actionButtons = document.querySelectorAll('[data-action]');
const dialog = document.querySelector('#navigation-dialog');
const dialogMessage = document.querySelector('#navigation-message');
const menuButtons = document.querySelectorAll('[data-section]');

const routes = {
    cadastrar: '../cadastrar-corretor/index.html',
    pesquisa: '../pesquisar-corretor/index.html',
    editar: '../listagem-corretor/index.html',
    excluir: '../listagem-corretor/index.html'
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

menuButtons.forEach((button) => {
    button.addEventListener('click', () => {
        const secao = button.dataset.section;

        if (secao === 'Início') {
            window.location.href = '../../tela-inicial/index.html';
            return;
        }

        if (secao === 'Corretores') {
            return;
        }

        if (secao === 'Clientes') {
            window.location.href = '../../cliente/acoes-cliente/index.html';
            return;
        }

        showUnavailable(
            `A seção “${secao}” ainda não está disponível no módulo de corretores.`
        );
    });
});

document.querySelectorAll('[data-close]').forEach((button) => {
    button.addEventListener('click', () => dialog.close());
});

