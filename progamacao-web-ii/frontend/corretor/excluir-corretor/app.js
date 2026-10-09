const modal = document.querySelector('#modal-exclusao');
const modalSucesso = document.querySelector('#modal-sucesso');
const deleteButton = document.querySelector('#btn-excluir');
const confirmButton = document.querySelector('#btn-confirmar');
const parametros = new URLSearchParams(window.location.search);
const id_corretor = parametros.get("id")|| parametros.get("id_corretor");;

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

function formatarTipo(tipo = "") {
    if (!tipo) return "";
    return tipo.charAt(0).toUpperCase() + tipo.slice(1);
}

async function carregarCorretor() {
    try {
        const resposta = await fetch(`http://localhost:3000/corretor/${id_corretor}`);

        const corretor = await resposta.json();

        if (!resposta.ok) {
            throw new Error(corretor.erro || corretor.mensagem || "Erro ao carregar corretor.");
        }

        document.querySelector("#name").value = corretor.nome;
        document.querySelector("#document").value = formatarDocumento(corretor.cpf_cnpj);
        document.querySelector("#creci").value = corretor.creci_corretor;
        document.querySelector("#birthDate").value = formatarData(corretor.data_nascimento || "");
        document.querySelector("#phone").value = formatarTelefone(corretor.telefone ?? "");
        document.querySelector("#email").value = corretor.email;
        document.querySelector("#postalCode").value = formatarCep(corretor.cep || "");
        document.querySelector("#complement").value = corretor.complemento || "";
        document.querySelector("#street").value = corretor.logradouro || "";
        document.querySelector("#number").value = corretor.numero || "";
        document.querySelector("#neighborhood").value = corretor.bairro || "";
        document.querySelector("#city").value = corretor.cidade || "";
        document.querySelector("#state").value = corretor.uf || "";
        document.querySelector("#type").value = formatarTipo(corretor.tipo);

    } catch (error) {
        console.error(error);
        status.textContent = error.message;
    }
}

carregarCorretor();

// Abre o modal de confirmação
deleteButton.addEventListener('click', () => modal.showModal());

// Fecha ao clicar em "Não" (Esc já é tratado pelo <dialog>)
document.querySelector('#btn-nao').addEventListener('click', () => modal.close());

// Fecha os modais ao clicar no fundo escuro, fora da caixa
[modal, modalSucesso].forEach(dialogo => {
    dialogo.addEventListener('click', event => {
        if (event.target === dialogo) dialogo.close();
    });
});

// Exclusão do corretor
confirmButton.addEventListener('click', async () => {
  confirmButton.disabled = true;

  try {
    const resposta = await fetch(`http://localhost:3000/corretor/${id_corretor}`, {
      method: 'DELETE'
    });

    const resultado = await resposta.json();
    console.log('Resposta do Backend:', JSON.stringify(resultado, null, 2));

    if (!resposta.ok) {
      throw new Error(resultado.erro || 'Erro ao excluir corretor!');
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
    window.location.href = "../listagem-corretor/index.html";
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
            window.location.href = "../../cliente/acoes-cliente/index.html";
            return;
        }

        if (secao === 'Corretores') {
            window.location.href = "../acoes-corretor/index.html";
            return;
        }

        document.querySelector('#navigation-message').textContent =
            `A seção “${secao}” ainda não está disponível.`;

        document.querySelector('#navigation-dialog').showModal();
    });
});
