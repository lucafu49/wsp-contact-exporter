// Escucha el mensaje desde popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "extractContacts") {
    scrollSidebarAndExtractContacts();
    sendResponse({ success: true });
  }
});

// Set global para almacenar números únicos
let allUnsavedContacts = new Set();

// Variable para almacenar los últimos contactos vistos
let lastSeenContacts = new Set();
let repeatCount = 0; // Contador de repeticiones

function scrollSidebarAndExtractContacts() {
  const sidebar = document.querySelector("div#pane-side.x1n2onr6._ak9y");
  if (!sidebar) {
    console.error("No se encontró el panel lateral.");
    return;
  }

  const scrollStep = 350; // Cantidad de píxeles por desplazamiento
  const delay = 1000; // Tiempo de espera entre desplazamientos (1 segundo)
  const maxRepeats = 5; // Número máximo de repeticiones permitidas

  const interval = setInterval(() => {
    sidebar.scrollBy(0, scrollStep);
    console.log("Desplazamiento realizado:", scrollStep, "píxeles");

    // Extraer contactos en cada desplazamiento
    const newContacts = extractContacts();

    // Verificar si los contactos se repiten
    if (newContacts.size === 0 || setsAreEqual(newContacts, lastSeenContacts)) {
      repeatCount++;
      console.log(`Repetición detectada: ${repeatCount}`);
    } else {
      repeatCount = 0; // Reiniciar el contador si hay nuevos contactos
    }

    // Actualizar los últimos contactos vistos
    lastSeenContacts = new Set(newContacts);

    // Detener el bucle si se alcanza el número máximo de repeticiones
    if (repeatCount >= maxRepeats) {
      clearInterval(interval);
      console.log("Se detectaron repeticiones consecutivas. Deteniendo el bucle...");
      saveContactsToFile(); // Guardar contactos al finalizar
    }
  }, delay);
}

// Función para extraer contactos
function extractContacts() {
  const contacts = document.querySelectorAll("div.x1n2onr6");
  const newContacts = new Set();

  contacts.forEach((contact) => {
    const phoneElement = contact.querySelector("span[title]");
    if (phoneElement) {
      const phone = phoneElement.getAttribute("title").trim();

      if (phone.startsWith("+")) {
        allUnsavedContacts.add(phone); // Agregar al Set global
        newContacts.add(phone); // Agregar al Set de contactos actuales
      }
    }
  });

  console.log(`Total números guardados: ${allUnsavedContacts.size}`);
  return newContacts;
}

// Función para comparar dos Sets
function setsAreEqual(set1, set2) {
  if (set1.size !== set2.size) return false;
  for (const item of set1) {
    if (!set2.has(item)) return false;
  }
  return true;
}

// Función para guardar los contactos en un archivo JSON
function saveContactsToFile() {
  if (allUnsavedContacts.size > 0) {
    const contactsArray = Array.from(allUnsavedContacts); // Convertir Set a Array
    const blob = new Blob([JSON.stringify(contactsArray, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    chrome.runtime.sendMessage({ action: "download", url: url });
    console.log("Archivo con contactos guardado.");
  } else {
    console.log("No se encontraron contactos para guardar.");
  }
}