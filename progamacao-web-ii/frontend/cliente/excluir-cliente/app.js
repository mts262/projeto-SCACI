const modal = document.querySelector('#modal-exclusao');
const status = document.querySelector('#status-exclusao');
const confirmButton = document.querySelector('#btn-confirmar');

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

// Exclusão simulada — apenas front por enquanto
confirmButton.addEventListener('click', async () => {
  confirmButton.disabled = true;

  try {
    // TODO backend: await fetch(`/api/clientes/${id}`, { method: 'DELETE' });
    modal.close();
    status.textContent = 'Cliente excluído com sucesso.';
  } catch {
    modal.close();
    status.textContent = 'Erro ao excluir. Tente novamente.';
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
