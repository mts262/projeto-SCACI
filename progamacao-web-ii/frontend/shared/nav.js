// Raiz do frontend = pasta acima de "shared"
const RAIZ = new URL('../', document.currentScript.src).href;

const ROTAS = {
  'Início':       'tela-inicial/index.html',
  'Clientes':     'cliente/acoes-cliente/index.html',
  'Corretores':   'corretor/acoes-corretor/index.html',
  'Funcionários': 'funcionario/acoes-funcionario/index.html'
};

document.querySelectorAll('[data-section]').forEach(button => {
  button.addEventListener('click', () => {
    const secao = button.dataset.section;

    if (ROTAS[secao]) {
      window.location.href = RAIZ + ROTAS[secao];
      return;
    }

    document.querySelector('#navigation-message').textContent =
      `A seção “${secao}” ainda não está disponível.`;
    document.querySelector('#navigation-dialog').showModal();
  });
});