const modal = document.querySelector('#modal-exclusao');
const status = document.querySelector('#status-exclusao');
const confirmButton = document.querySelector('#btn-confirmar');
const id_cliente = 24; // temporário até implementação das telas de listagem e pesquisar cliente

// Abre o modal de confirmação
document.querySelector('#btn-excluir').addEventListener('click', () => {
  status.textContent = '';
  modal.showModal();
});

// Fecha ao clicar em "Não" (Esc já é tratado pelo <dialog>)
document.querySelector('#btn-nao').addEventListener('click', () => modal.close());

// Fecha ao clicar no fundo escuro, fora da caixa
modal.addEventListener('click', event => {
  if (event.target === modal) modal.close();
});

// Exclusão do clinete
confirmButton.addEventListener('click', async () => {
  confirmButton.disabled = true;

  try {
    // substituir o id_cliente fixo no teste pelo ID do cliente 
    // que o usuário realmente selecionar na tela de pesquisa/listagem.
    const resposta = await fetch(`http://localhost:3000/cliente/${id_cliente}`, {
      method: 'DELETE'
    });

    const resultado = await resposta.json();
    console.log('Resposta do Backend:', resultado);

    if (!resposta.ok) {
      throw new Error(resultado.erro || 'Erro ao excluir cliente!');
    }
    
    modal.close();
    status.textContent = resultado.mensagem;
  } catch (error) {
    console.log(error);

    modal.close();
    status.textContent = error.message;
  } finally {
    confirmButton.disabled = false;
  }
});

// Navegação do menu
document.querySelectorAll('[data-section]').forEach(button => button.addEventListener('click', () => {
  if (button.dataset.section !== 'Clientes') {
    document.querySelector('#navigation-message').textContent = `A seção “${button.dataset.section}” ainda não está disponível.`;
    document.querySelector('#navigation-dialog').showModal();
  }
}));
