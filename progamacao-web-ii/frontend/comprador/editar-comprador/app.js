document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("buyer-form");
  const clientInput = document.getElementById("client");
  const clientIdInput = document.getElementById("clientId");
  const clientList = document.getElementById("client-list");
  const clientError = document.getElementById("client-error");
  
  const dropZone = document.getElementById("drop-zone");
  const fileInput = document.getElementById("proof");
  const fileNameSpan = document.getElementById("file-name");
  const saveStatus = document.getElementById("save-status");

  loadBuyerData();

  function loadBuyerData() {
    const buyerData = {
      clientId: "12",
      clientSearch: "Maria Souza (123.456.789-00)",
      income: "5500,00",
      occupation: "Analista de Sistemas",
      desiredPropertyType: "Apartamento",
      minValue: "200000",
      maxValue: "350000",
      purchaseDeadline: "2026-12-31",
      desiredDescription: "Próximo ao metrô, 2 quartos",
      minArea: "60",
      desiredLocation: "Centro",
      paymentType: "prazo"
    };

    clientIdInput.value = buyerData.clientId;
    clientInput.value = buyerData.clientSearch;
    document.getElementById("income").value = buyerData.income;
    document.getElementById("occupation").value = buyerData.occupation;
    document.getElementById("desiredPropertyType").value = buyerData.desiredPropertyType;
    document.getElementById("minValue").value = buyerData.minValue;
    document.getElementById("maxValue").value = buyerData.maxValue;
    
    if (buyerData.purchaseDeadline) {
      const deadlineInput = document.getElementById("purchaseDeadline");
      deadlineInput.type = "date";
      deadlineInput.value = buyerData.purchaseDeadline;
    }

    document.getElementById("desiredDescription").value = buyerData.desiredDescription;
    document.getElementById("minArea").value = buyerData.minArea;
    document.getElementById("desiredLocation").value = buyerData.desiredLocation;
    document.getElementById("paymentType").value = buyerData.paymentType;
  }

  const mockClients = [
    { id: "12", name: "Maria Souza", cpf: "123.456.789-00" },
    { id: "15", name: "Carlos Alberto", cpf: "987.654.321-11" },
    { id: "22", name: "Ana Paula Costa", cpf: "456.123.789-22" }
  ];

  clientInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase().trim();
    clientIdInput.value = "";

    if (query.length === 0) {
      clientList.hidden = true;
      clientInput.setAttribute("aria-expanded", "false");
      clientList.innerHTML = "";
      return;
    }

    const filtered = mockClients.filter(c => 
      c.name.toLowerCase().includes(query) || c.cpf.includes(query)
    );

    clientList.innerHTML = "";

    if (filtered.length > 0) {
      filtered.forEach(client => {
        const li = document.createElement("li");
        li.setAttribute("role", "option");
        li.setAttribute("data-id", client.id);
        li.innerHTML = `${client.name} <small>${client.cpf}</small>`;
        
        li.addEventListener("click", () => {
          clientInput.value = `${client.name} (${client.cpf})`;
          clientIdInput.value = client.id;
          clientList.hidden = true;
          clientInput.setAttribute("aria-expanded", "false");
          clientError.textContent = "";
        });

        clientList.appendChild(li);
      });
      clientList.hidden = false;
      clientInput.setAttribute("aria-expanded", "true");
    } else {
      const li = document.createElement("li");
      li.className = "empty";
      li.textContent = "Nenhum cliente encontrado";
      clientList.appendChild(li);
      clientList.hidden = false;
      clientInput.setAttribute("aria-expanded", "true");
    }
  });

  document.addEventListener("click", (e) => {
    if (!clientInput.contains(e.target) && !clientList.contains(e.target)) {
      clientList.hidden = true;
      clientInput.setAttribute("aria-expanded", "false");
    }
  });

  fileInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
      fileNameSpan.textContent = `Arquivo selecionado: ${e.target.files[0].name}`;
    }
  });

  ["dragenter", "dragover"].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropZone.classList.add("dragover");
    }, false);
  });

  ["dragleave", "drop"].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropZone.classList.remove("dragover");
    }, false);
  });

  dropZone.addEventListener("drop", (e) => {
    if (e.dataTransfer.files.length > 0) {
      fileInput.files = e.dataTransfer.files;
      fileNameSpan.textContent = `Arquivo selecionado: ${e.dataTransfer.files[0].name}`;
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!clientIdInput.value) {
      clientError.textContent = "Por favor, selecione um cliente válido da lista.";
      clientInput.focus();
      return;
    } else {
      clientError.textContent = "";
    }

    const formData = new FormData(form);
    
    saveStatus.textContent = "Salvando alterações...";
    
    setTimeout(() => {
      saveStatus.textContent = "Alterações salvas com sucesso!";
      
      setTimeout(() => {
        saveStatus.textContent = "";
      }, 4000);
    }, 1000);
  });
});