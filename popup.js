document.addEventListener('DOMContentLoaded', function() {
    // Load saved API key
    chrome.storage.local.get(['apiKey'], function(result) {
        if (result.apiKey) {
            document.getElementById('apiKey').value = result.apiKey;
        }
    });
  
    // Save API key when entered
    document.getElementById('apiKey').addEventListener('change', function(e) {
        chrome.storage.local.set({ apiKey: e.target.value });
    });

    function showStatus(message, isError = false) {
        const status = document.getElementById('status');
        status.textContent = message;
        status.style.display = 'block';
        status.className = 'status ' + (isError ? 'status-error' : 'status-success');
        
        // Add error/success specific styling
        if (isError) {
            status.style.backgroundColor = 'rgba(220, 38, 38, 0.1)';
            status.style.borderColor = 'rgba(220, 38, 38, 0.2)';
            status.style.color = '#ef4444';
        } else {
            status.style.backgroundColor = 'rgba(34, 197, 94, 0.1)';
            status.style.borderColor = 'rgba(34, 197, 94, 0.2)';
            status.style.color = '#22c55e';
        }

        setTimeout(() => {
            status.style.display = 'none';
        }, 3000);
    }

    // Add status message handler
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'STATUS_UPDATE') {
            showStatus(message.message, message.status === 'error');
        }
    });
  
    // Single click handler setup with status handling
    const buttons = ['improveWriting', 'makeFormal', 'makeCreative', 'custom'];
    buttons.forEach(buttonId => {
        document.getElementById(buttonId).addEventListener('click', function() {
            const button = this;
            button.disabled = true;
            
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: buttonId
                }, (response) => {
                    button.disabled = false;
                    if (chrome.runtime.lastError) {
                        showStatus(chrome.runtime.lastError.message, true);
                    }
                });
            });
        });
    });
});
