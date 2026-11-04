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
      const destino = RAIZ + ROTAS[secao];

      // Já está na tela de ações dessa seção: não recarrega
      if (destino === window.location.href.split('?')[0].split('#')[0]) return;

      window.location.href = destino;
      return;
    }

    document.querySelector('#navigation-message').textContent =
      `A seção “${secao}” ainda não está disponível.`;
    document.querySelector('#navigation-dialog').showModal();
  });
});