'use strict';
const storageKey = 'scaci.corretores.v1';
const $ = (selector) => document.querySelector(selector);
const form = $('#broker-form');
let brokers = [];
let selectedId = null;
let editingId = null;
const normalize = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const validRecord = (record) => record && ['id', 'name', 'creci', 'email', 'phone'].every((key) => typeof record[key] === 'string') && ['interno', 'externo'].includes(record.type);
try {
  const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
  if (!Array.isArray(saved) || !saved.every(validRecord) || new Set(saved.map((record) => record.id)).size !== saved.length) throw new Error('Invalid data');
  brokers = saved;
} catch {
  $('#status').textContent = 'Não foi possível carregar os cadastros locais. Verifique se o armazenamento do navegador está disponível.';
}
function persist(next) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(next));
    brokers = next;
    render();
    return true;
  } catch {
    return false;
  }
}
function render() {
  const query = normalize($('#search').value.trim());
  const type = $('#type-filter').value;
  const filtered = brokers.filter((broker) => (!type || broker.type === type) && normalize(`${broker.name} ${broker.creci} ${broker.email}`).includes(query));
  $('#total').textContent = brokers.length;
  $('#internal').textContent = brokers.filter((broker) => broker.type === 'interno').length;
  $('#external').textContent = brokers.filter((broker) => broker.type === 'externo').length;
  $('#brokers').replaceChildren();
  for (const broker of filtered) {
    const row = document.createElement('tr');
    const nameCell = row.insertCell();
    nameCell.append(document.createTextNode(broker.name));
    const email = document.createElement('small');
    email.textContent = broker.email;
    nameCell.append(email);
    row.insertCell().textContent = broker.creci;
    const badge = document.createElement('span');
    badge.className = 'type-badge';
    badge.textContent = broker.type === 'interno' ? 'Interno' : 'Externo';
    row.insertCell().append(badge);
    const actions = document.createElement('div');
    actions.className = 'row-actions';
    for (const [action, label] of [['view', 'Visualizar'], ['edit', 'Editar'], ['delete', 'Excluir']]) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = label;
      button.setAttribute('aria-label', `${label} ${broker.name}`);
      button.addEventListener('click', () => handleAction(action, broker.id));
      actions.append(button);
    }
    row.insertCell().append(actions);
    $('#brokers').append(row);
  }
  $('#empty').hidden = filtered.length > 0;
  $('#result-count').textContent = `${filtered.length} de ${brokers.length} corretor(es)`;
}
function openForm(broker) {
  form.reset();
  editingId = broker?.id || null;
  $('#form-title').textContent = broker ? 'Editar corretor' : 'Cadastrar corretor';
  $('#form-error').textContent = '';
  for (const field of ['name', 'creci', 'type', 'email', 'phone']) {
    form.elements[field].setCustomValidity('');
    if (broker) form.elements[field].value = broker[field];
  }
  $('#broker-dialog').showModal();
  form.elements.name.focus();
}
function handleAction(action, id) {
  const broker = brokers.find((item) => item.id === id);
  if (!broker) return;
  selectedId = id;
  if (action === 'edit') return openForm(broker);
  if (action === 'delete') {
    $('#delete-message').textContent = `O cadastro de ${broker.name} será removido deste navegador.`;
    $('#delete-dialog').showModal();
    return;
  }
  $('#details').replaceChildren();
  for (const [label, value] of [['Nome completo', broker.name], ['CRECI', broker.creci], ['Tipo', broker.type === 'interno' ? 'Interno' : 'Externo'], ['E-mail', broker.email], ['Telefone', broker.phone]]) {
    const term = document.createElement('dt');
    const description = document.createElement('dd');
    term.textContent = label;
    description.textContent = value;
    $('#details').append(term, description);
  }
  $('#details-dialog').showModal();
}
form.addEventListener('input', (event) => event.target.setCustomValidity?.(''));
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  for (const key of Object.keys(data)) data[key] = data[key].trim();
  for (const key of ['name', 'creci', 'email', 'phone']) {
    if (!data[key]) {
      form.elements[key].setCustomValidity('Preencha este campo.');
      form.elements[key].reportValidity();
      return;
    }
  }
  if (![10, 11].includes(data.phone.replace(/\D/g, '').length)) {
    form.elements.phone.setCustomValidity('Informe um telefone com DDD e 10 ou 11 dígitos.');
    form.elements.phone.reportValidity();
    return;
  }
  if (brokers.some((broker) => broker.id !== editingId && (normalize(broker.creci) === normalize(data.creci) || normalize(broker.email) === normalize(data.email)))) {
    $('#form-error').textContent = 'Já existe um corretor com este CRECI ou e-mail.';
    return;
  }
  const record = { ...data, id: editingId || crypto.randomUUID() };
  const next = editingId ? brokers.map((broker) => broker.id === editingId ? record : broker) : [...brokers, record];
  if (!persist(next)) {
    $('#form-error').textContent = 'Não foi possível salvar. Verifique o armazenamento do navegador e tente novamente.';
    return;
  }
  $('#broker-dialog').close();
  $('#status').textContent = editingId ? 'Cadastro atualizado com sucesso.' : 'Corretor cadastrado com sucesso.';
  $('#new-broker').focus();
});
$('#confirm-delete').addEventListener('click', () => {
  if (!persist(brokers.filter((broker) => broker.id !== selectedId))) {
    $('#delete-message').textContent = 'Não foi possível excluir. Verifique o armazenamento do navegador e tente novamente.';
    return;
  }
  $('#delete-dialog').close();
  $('#status').textContent = 'Corretor excluído com sucesso.';
  $('#new-broker').focus();
});
$('#edit-details').addEventListener('click', () => {
  $('#details-dialog').close();
  handleAction('edit', selectedId);
});
$('#new-broker').addEventListener('click', () => openForm());
$('#search').addEventListener('input', render);
$('#type-filter').addEventListener('change', render);
document.querySelectorAll('[data-close]').forEach((button) => button.addEventListener('click', () => button.closest('dialog').close()));
document.querySelectorAll('[data-section]').forEach((button) => button.addEventListener('click', () => {
  $('#navigation-message').textContent = `O módulo ${button.dataset.section} ainda não está disponível nesta tela.`;
  $('#navigation-dialog').showModal();
}));
render();

