// Helper para manter apenas dígitos
const digits = (str) => (str || '').replace(/\D/g, '');

// Preenchimento de UFs
const ufs = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];
const stateSelect = document.getElementById('state');
ufs.forEach(uf => {
  const opt = document.createElement('option');
  opt.value = uf;
  opt.textContent = uf;
  stateSelect.appendChild(opt);
});

// Busca CEP Automática (ViaCEP API)
document.getElementById('postalCode').addEventListener('blur', async (e) => {
  const cep = digits(e.target.value);
  if (cep.length === 8) {
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        document.getElementById('street').value = data.logradouro;
        document.getElementById('neighborhood').value = data.bairro;
        document.getElementById('city').value = data.localidade;
        document.getElementById('state').value = data.uf;
      }
    } catch (err) {
      console.error('Erro ao buscar CEP:', err);
    }
  }
});

// Envio do Formulário e Persistência
const form = document.getElementById('broker-form');
const saveStatus = document.getElementById('save-status');

form.addEventListener('submit', async (e) => {

    e.preventDefault();

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    try {

        const dadosCorretor = {
            tipo: form.elements.brokerType.value,
            creci_corretor: form.elements.creci.value,
            nome: form.elements.name.value,
            cpf_cnpj: digits(form.elements.document.value),
            data_nascimento: form.elements.birthDate.value.trim() || null,
            telefone: form.elements.phone.value,
            email: form.elements.email.value,
            logradouro: form.elements.street.value.trim() || null,
            numero: form.elements.number.value.trim() || null,
            bairro: form.elements.neighborhood.value.trim() || null,
            complemento: form.elements.complement.value.trim() || null,
            cidade: form.elements.city.value.trim() || null,
            uf: form.elements.state.value.trim() || null,
            cep: digits(form.elements.postalCode.value) || null
        };

        const resposta = await fetch('http://localhost:3000/corretor', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosCorretor)
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                resultado.erro ||
                resultado.detalhes ||
                'Erro ao cadastrar corretor.'
            );
        }

        saveStatus.textContent = 'Corretor cadastrado com sucesso!';
        form.reset();

    } catch (error) {

        console.error('Erro na requisição:', error);

        saveStatus.textContent = error.message;

    } finally {

        setTimeout(() => {
            saveStatus.textContent = '';
        }, 4000);
    }
});