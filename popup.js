document.getElementById("extract").addEventListener("click", () => {
    const status = document.getElementById("status");
  
    // Envía un mensaje al content script para iniciar la extracción
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].url.startsWith("https://web.whatsapp.com/")) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "extractContacts" }, (response) => {
          if (response && response.success) {
            status.textContent = "Contactos extraídos correctamente.";
          } else {
            status.textContent = "Error al extraer contactos.";
          }
        });
      } else {
        status.textContent = "Abre WhatsApp Web para usar esta extensión.";
      }
    });
  });