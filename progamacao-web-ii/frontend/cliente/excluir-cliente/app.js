const modal = document.querySelector('#modal-exclusao');
const status = document.querySelector('#status-exclusao');
const confirmButton = document.querySelector('#btn-confirmar');
const parametros = new URLSearchParams(window.location.search);
const id_cliente = parametros.get("id");

async function carregarCliente() {
    try {
        const resposta = await fetch(`http://localhost:3000/cliente/${id_cliente}`);

        const cliente = await resposta.json();

        if (!resposta.ok) {
            throw new Error(cliente.erro || cliente.mensagem || "Erro ao carregar cliente.");
        }

        document.querySelector("#name").value = cliente.nome;
        document.querySelector("#document").value = cliente.cpf_cnpj;
        document.querySelector("#birthDate").value = cliente.data_nascimento;
        document.querySelector("#phone").value = cliente.telefone;
        document.querySelector("#email").value = cliente.email || "";
        document.querySelector("#postalCode").value = cliente.cep;
        document.querySelector("#street").value = cliente.logradouro;
        document.querySelector("#number").value = cliente.numero;
        document.querySelector("#neighborhood").value = cliente.bairro;
        document.querySelector("#city").value = cliente.cidade;
        document.querySelector("#state").value = cliente.uf;
        document.querySelector("#maritalStatus").value = cliente.estado_civil;

    } catch (error) {
        console.error(error);
        status.textContent = error.message;
    }
}

carregarCliente();

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
    console.log('Resposta do Backend:', JSON.stringify(resultado, null, 2));

    if (!resposta.ok) {
      throw new Error(resultado.erro || 'Erro ao excluir cliente!');
    }
    
    modal.close();
    status.textContent = "Cliente excluído com sucesso!";

    setTimeout(() => {
      window.location.href = "../listagem-clientes/index.html";
    }, 1000);
  } catch (error) {
    console.log(error);

    modal.close();
    status.textContent = error.message;
  } finally {
    confirmButton.disabled = false;
  }
});

// Navegação do menu
document.querySelectorAll('[data-section]').forEach(button => {
    button.addEventListener('click', () => {
        const secao = button.dataset.section;

        if (secao === 'Início') {
            window.location.href = "../../tela-inicial/index.html";
            return;
        }

        if (secao === 'Clientes') {
            window.location.href = "../acoes-cliente/index.html";
            return;
        }

        document.querySelector('#navigation-message').textContent =
            `A seção “${secao}” ainda não está disponível.`;

        document.querySelector('#navigation-dialog').showModal();
    });
});
