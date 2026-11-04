const modal = document.querySelector('#modal-exclusao');
const modalSucesso = document.querySelector('#modal-sucesso');
const deleteButton = document.querySelector('#btn-excluir');
const confirmButton = document.querySelector('#btn-confirmar');
const parametros = new URLSearchParams(window.location.search);
const id_funcionario = parametros.get("id")|| parametros.get("id_funcionario");
const statusMsg = document.querySelector('#save-status');

function apenasDigitos(valor = "") {
    return String(valor).replace(/\D/g, "");
}

function formatarDocumento(valor = "") {
    const digitos = apenasDigitos(valor);

    if (digitos.length === 11) {
        return digitos.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
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

async function carregarFuncionario() {
    try {
        const resposta = await fetch(`http://localhost:3000/funcionario/${id_funcionario}`);



        const funcionario = await resposta.json();

        if (!resposta.ok) {
            throw new Error(funcionario.erro || funcionario.mensagem || "Erro ao carregar funcionário.");
        }

        document.querySelector("#name").value = funcionario.nome;
        document.querySelector("#document").value = formatarDocumento(funcionario.cpf);
        document.querySelector("#salary").value = Number(funcionario.salario).toLocaleString('pt-BR', 
            { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        document.querySelector("#jobTitle").value = funcionario.funcao || "";
        document.querySelector("#phone").value = formatarTelefone(funcionario.telefone);
        document.querySelector("#email").value = funcionario.email;

    } catch (error) {
        console.error(error);
        statusMsg.textContent = error.message;
    }
}

carregarFuncionario();

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

// Exclusão do funcionário
confirmButton.addEventListener('click', async () => {
  confirmButton.disabled = true;

  try {
    const resposta = await fetch(`http://localhost:3000/funcionario/${id_funcionario}`, {
      method: 'DELETE'
    });

    const resultado = await resposta.json().catch(() => ({}));
    console.log('Resposta do Backend:', JSON.stringify(resultado, null, 2));

    if (!resposta.ok) {
      throw new Error(resultado.erro || 'Erro ao excluir funcionário!');
    }
    
    modal.close();
    modalSucesso.showModal();
  } catch (error) {
    console.log(error);

    modal.close();
    statusMsg.textContent = error.message;
  } finally {
    confirmButton.disabled = false;
  }
});

// Fecha o modal de sucesso
document.querySelector('#btn-ok').addEventListener('click', () => {
    modalSucesso.close();
    window.location.href = "../listagem-funcionario/index.html";
});