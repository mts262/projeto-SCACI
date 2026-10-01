const modal = document.querySelector('#modal-exclusao');
const modalSucesso = document.querySelector('#modal-sucesso');
const status = document.querySelector('#status-exclusao');
const confirmButton = document.querySelector('#btn-confirmar');
const parametros = new URLSearchParams(window.location.search);
const id_cliente = parametros.get("id");

function apenasDigitos(valor = "") {
    return String(valor).replace(/\D/g, "");
}

function formatarDocumento(valor = "") {
    const digitos = apenasDigitos(valor);

    if (digitos.length === 11) {
        return digitos.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }

    if (digitos.length === 14) {
        return digitos.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
    }

    return valor;
}

function formatarTelefone(valor = "") {
    const digitos = apenasDigitos(valor);

    if (digitos.length === 11) {
        return digitos.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }

    if (digitos.length === 10) {
        return digitos.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }

    return valor;
}

function formatarCep(valor = "") {
    const digitos = apenasDigitos(valor);

    if (digitos.length === 8) {
        return digitos.replace(/(\d{5})(\d{3})/, "$1-$2");
    }

    return valor;
}

// Converte a data ISO (aaaa-mm-dd) para dd/mm/aaaa (usa UTC para não perder um dia por fuso)
function formatarData(valor) {
    if (!valor) return "";

    const data = new Date(valor);
    if (isNaN(data)) return "";

    const dia = String(data.getUTCDate()).padStart(2, "0");
    const mes = String(data.getUTCMonth() + 1).padStart(2, "0");
    return `${dia}/${mes}/${data.getUTCFullYear()}`;
}

async function carregarCliente() {
    try {
        const resposta = await fetch(`http://localhost:3000/cliente/${id_cliente}`);

        const cliente = await resposta.json();

        if (!resposta.ok) {
            throw new Error(cliente.erro || cliente.mensagem || "Erro ao carregar cliente.");
        }

        document.querySelector("#name").value = cliente.nome;
        document.querySelector("#document").value = formatarDocumento(cliente.cpf_cnpj);
        document.querySelector("#birthDate").value = formatarData(cliente.data_nascimento);
        document.querySelector("#phone").value = formatarTelefone(cliente.telefone);
        document.querySelector("#email").value = cliente.email || "";
        document.querySelector("#postalCode").value = formatarCep(cliente.cep);
        document.querySelector('#complement').value = cliente.complemento;
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
[modal, modalSucesso].forEach(dialogo => {
    dialogo.addEventListener('click', event => {
        if (event.target === dialogo) {
            dialogo.close();
        }
    });
});

// Exclusão do clinete
confirmButton.addEventListener('click', async () => {
  confirmButton.disabled = true;

  try {
    const resposta = await fetch(`http://localhost:3000/cliente/${id_cliente}`, {
      method: 'DELETE'
    });

    const resultado = await resposta.json();
    console.log('Resposta do Backend:', JSON.stringify(resultado, null, 2));

    if (!resposta.ok) {
      throw new Error(resultado.erro || 'Erro ao excluir cliente!');
    }
    
    modal.close();
    modalSucesso.showModal();

  } catch (error) {
    console.log(error);

    modal.close();
    status.textContent = error.message;
  } finally {
    confirmButton.disabled = false;
  }
});

// Fecha o modal de sucesso
document.querySelector('#btn-ok').addEventListener('click', () => {
    modalSucesso.close();
    window.location.href = "../listagem-clientes/index.html";
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

        if (secao === 'Corretores') {
            window.location.href = "../../corretor/acoes-corretor/index.html";
            return;
        }

        document.querySelector('#navigation-message').textContent =
            `A seção “${secao}” ainda não está disponível.`;

        document.querySelector('#navigation-dialog').showModal();
    });
});
