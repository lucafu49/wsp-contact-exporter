chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "download" && message.url) {
      chrome.downloads.download({
        url: message.url,
        filename: "unsaved_contacts.json",
      });
    }
  });