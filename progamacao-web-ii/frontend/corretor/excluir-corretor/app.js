// Protótipo: dados mockados, sem integração com o backend
const corretorMock = {
    id_corretor: 1,
    tipo: "externo",
    creci_corretor: "CRECI67891",
    nome: "Pedro Lucas Dos Santos Xavier",
    cpf_cnpj: "91888340580",
    data_nascimento: "2005-06-27",
    telefone: "77988488072",
    email: "Pedrin007@gmail.com",
    cep: "45000000",
    complemento: "Casa",
    logradouro: "Avenida Brasil",
    numero: "2288",
    bairro: "Recreio",
    cidade: "Vitória da Conquista",
    uf: "BA"
};

const modal = document.querySelector('#modal-exclusao');
const modalSucesso = document.querySelector('#modal-sucesso');
const deleteButton = document.querySelector('#btn-excluir');
const confirmButton = document.querySelector('#btn-confirmar');

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

function preencherCampos(corretor) {
    document.querySelector("#name").value = corretor.nome ?? "";
    document.querySelector("#document").value = formatarDocumento(corretor.cpf_cnpj ?? "");
    document.querySelector("#creci").value = corretor.creci_corretor ?? "";
    document.querySelector("#birthDate").value = formatarData(corretor.data_nascimento);
    document.querySelector("#phone").value = formatarTelefone(corretor.telefone ?? "");
    document.querySelector("#email").value = corretor.email ?? "";
    document.querySelector("#postalCode").value = formatarCep(corretor.cep ?? "");
    document.querySelector("#complement").value = corretor.complemento ?? "";
    document.querySelector("#street").value = corretor.logradouro ?? "";
    document.querySelector("#number").value = corretor.numero ?? "";
    document.querySelector("#neighborhood").value = corretor.bairro ?? "";
    document.querySelector("#city").value = corretor.cidade ?? "";
    document.querySelector("#state").value = corretor.uf ?? "";
    document.querySelector("#type").value = formatarTipo(corretor.tipo);
}

preencherCampos(corretorMock);

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

// Exclusão simulada do corretor
confirmButton.addEventListener('click', () => {
    console.log(`Exclusão simulada do corretor ${corretorMock.id_corretor}.`);

    modal.close();
    modalSucesso.showModal();

    // Permanece na tela, mas impede uma nova exclusão
    deleteButton.disabled = true;
});

// Fecha o modal de sucesso
document.querySelector('#btn-ok').addEventListener('click', () => modalSucesso.close());

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
            window.location.href = "../listagem-corretor/index.html";
            return;
        }

        document.querySelector('#navigation-message').textContent =
            `A seção “${secao}” ainda não está disponível.`;

        document.querySelector('#navigation-dialog').showModal();
    });
});
