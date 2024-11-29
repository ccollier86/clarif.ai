let processingRequest = false;

// Create context menu items when the extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  const contextMenuItems = [
    { id: "improveWriting", title: "Improve Text" },
    { id: "makeFormal", title: "Make Formal" },
    { id: "makeCreative", title: "Make Creative" },
    { id: "custom", title: "Custom Style" }
  ];

  contextMenuItems.forEach(item => {
    chrome.contextMenus.create({
      id: item.id,
      title: item.title,
      contexts: ["editable"]
    });
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (tab.id) {
    chrome.tabs.sendMessage(tab.id, {
      action: info.menuItemId
    });
  }
});

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  console.log('Command received:', command);
  if (command === 'improveWriting') {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'improveWriting'
        });
      }
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'CLAUDE_API_REQUEST') {
        if (processingRequest) {
            sendResponse({ error: 'A request is already in progress' });
            return true;
        }

        (async () => {
            processingRequest = true;
            try {
                // Use the instruction provided or default to the original instruction
                const instruction = request.instruction || 'Improve this text and respond ONLY with the improved version, no additional text, explanations or formatting:';

                // Ensure the instruction ends with the directive
                const directive = 'and respond ONLY with the improved version, no additional text, explanations or formatting:';
                let finalInstruction = instruction;

                if (!instruction.includes(directive)) {
                    finalInstruction = `${instruction} ${directive}`;
                }

                const formattedContent = `${finalInstruction}

${request.content}`;

                const response = await fetch('https://api.anthropic.com/v1/messages', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': request.apiKey,
                        'anthropic-version': '2023-06-01',
                        'Accept': 'application/json',
                        'anthropic-dangerous-direct-browser-access': 'true'
                    },
                    body: JSON.stringify({
                        model: "claude-3-sonnet-20240229",
                        max_tokens: 1024,
                        messages: [{
                            role: "user",
                            content: formattedContent
                        }],
                        temperature: 0.3
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => null);
                    throw new Error(errorData?.error?.message || `API error: ${response.status}`);
                }

                const data = await response.json();

                // Clean the response of any potential prefixes/suffixes
                let cleanedText = data.content[0].text
                    .trim()
                    .replace(/^(Here('?s| is) (an )?(improved|enhanced|better|revised) version(:)?|While maintaining the same meaning(:)?|Improved text(:)?|Improved version(:)?|Enhanced text(:)?|Rewritten text(:)?)/i, '')
                    .replace(/^["'“”‘’`]/g, '') // Remove quotes if present
                    .replace(/^[-–—•*\s]+/g, '') // Remove leading dashes, bullets, or whitespace
                    .replace(/^\d+[\)\.\-:\s]+/g, '') // Remove leading numbers with punctuation
                    .trim();

                sendResponse({
                    data: cleanedText,
                    status: 'success'
                });
            } catch (error) {
                console.error('Background Script Error:', error);
                sendResponse({
                    error: error.message,
                    status: 'error'
                });
            } finally {
                processingRequest = false;
            }
        })();
        return true;
    }

    // Handle any other message types
    if (request.type === 'GET_PROCESSING_STATE') {
        sendResponse({ isProcessing: processingRequest });
        return true;
    }
});

// Listen for connections being closed to cleanup
chrome.runtime.onConnect.addListener((port) => {
    port.onDisconnect.addListener(() => {
        if (processingRequest) {
            processingRequest = false;
        }
    });
});
