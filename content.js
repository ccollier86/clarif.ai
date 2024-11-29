// content.js
let lastActiveElement = null;
let lastFocusedElement = null;
let isProcessing = false;

// Track both focus and click events
document.addEventListener('focus', function(e) {
    trackElement(e.target);
}, true);

document.addEventListener('click', function(e) {
    trackElement(e.target);
}, true);

function trackElement(element) {
    // Check if element is editable
    if (isEditableElement(element)) {
        lastActiveElement = element;
        lastFocusedElement = element;
    }
    // Handle contenteditable parent elements
    let parent = element.closest('[contenteditable="true"]');
    if (parent) {
        lastActiveElement = parent;
        lastFocusedElement = parent;
    }
}

function isEditableElement(element) {
    if (!element) return false;
    return element.tagName === 'TEXTAREA' || 
           (element.tagName === 'INPUT' && /^(text|email|password|search|tel|url)$/i.test(element.type)) ||
           element.isContentEditable ||
           element.getAttribute('contenteditable') === 'true' ||
           element.classList.contains('public-DraftEditor-content') || // React Draft.js
           element.classList.contains('ql-editor') || // Quill editor
           element.classList.contains('cke_editable') || // CKEditor
           element.classList.contains('tox-edit-area__iframe') || // TinyMCE
           element.classList.contains('notranslate') || // Facebook Messenger
           element.role === 'textbox';
}

function getElementText(element) {
    if (element.tagName === 'TEXTAREA' || (element.tagName === 'INPUT' && /^(text|email|password|search|tel|url)$/i.test(element.type))) {
        return element.value;
    } else if (element.getAttribute('contenteditable') === 'true' || element.isContentEditable) {
        return element.innerText || element.textContent;
    } else {
        return element.textContent;
    }
}

function getSelectionText(element) {
    if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
        const start = element.selectionStart;
        const end = element.selectionEnd;
        if (start !== end) {
            return element.value.substring(start, end);
        }
    } else if (element.isContentEditable || element.getAttribute('contenteditable') === 'true') {
        const selection = window.getSelection();
        if (selection.rangeCount > 0 && element.contains(selection.anchorNode)) {
            return selection.toString();
        }
    }
    return '';
}

function setElementText(element, text) {
    if (window.location.host.includes('facebook.com')) {
        // Special handling for Facebook Messenger
        facebookUpdate(element, text);
    } else if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
        // Use setNativeValue for undo/redo support
        setNativeValue(element, text);
        element.dispatchEvent(new Event('input', { bubbles: true }));
        // Set cursor to end
        element.setSelectionRange(element.value.length, element.value.length);
    } else if (element.isContentEditable || element.getAttribute('contenteditable') === 'true') {
        element.focus();
        // Use document.execCommand for undo/redo support
        document.execCommand('selectAll', false, null);
        document.execCommand('insertText', false, text);
        element.dispatchEvent(new Event('input', { bubbles: true }));
        // Move cursor to end
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            selection.collapseToEnd();
        }
    } else {
        element.textContent = text;
    }
}

function setSelectionText(element, text) {
    // Special handling for Gmail compose
    if (window.location.hostname.includes('mail.google.com')) {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            
            // Get the full content before changes
            const fullContent = element.innerText;
            
            // Insert new text
            range.deleteContents();
            const textNode = document.createTextNode(text);
            range.insertNode(textNode);
            
            // Cleanup: Remove any duplicate of original text that might have been appended
            setTimeout(() => {
                const updatedContent = element.innerText;
                if (updatedContent.includes(originalText)) {
                    const cleanContent = updatedContent.replace(originalText, '');
                    // Re-insert the cleaned content
                    element.innerText = cleanContent;
                    
                    // Trigger Gmail's events
                    element.dispatchEvent(new Event('input', { bubbles: true }));
                    element.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }, 0);
            
            return;
        }
    }
    // Regular input/textarea handling
    if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
        const start = element.selectionStart;
        const end = element.selectionEnd;
        const originalValue = element.value;
        
        const newValue = originalValue.substring(0, start) + text + originalValue.substring(end);
        setNativeValue(element, newValue);
        
        // Set cursor position after inserted text
        const newPosition = start + text.length;
        element.setSelectionRange(newPosition, newPosition);
        
        // Trigger events
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
    } 
    // ContentEditable handling (including other rich text editors)
    else if (element.isContentEditable || element.getAttribute('contenteditable') === 'true') {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            
            // Ensure we're working within the editable element
            if (!element.contains(range.commonAncestorContainer)) {
                return;
            }
            
            // Delete selected content
            range.deleteContents();
            
            // Create temporary div to handle HTML content if present
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = text;
            
            // Insert each node from the temp div
            const fragment = document.createDocumentFragment();
            while (tempDiv.firstChild) {
                fragment.appendChild(tempDiv.firstChild);
            }
            
            range.insertNode(fragment);
            
            // Set cursor after inserted text
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
            
            // Trigger appropriate events
            element.dispatchEvent(new Event('input', { bubbles: true }));
            element.dispatchEvent(new Event('change', { bubbles: true }));
            
            // Force update for certain editors
            document.execCommand('insertText', false, '');
        }
    }
}

// Helper function for consistent event triggering
function triggerInputEvents(element) {
    const events = ['input', 'change', 'blur', 'focus'];
    events.forEach(eventType => {
        element.dispatchEvent(new Event(eventType, { bubbles: true }));
    });
}

function facebookUpdate(element, text) {
    // Ensure we are on Facebook
    if (window.location.host.includes('facebook.com')) {
        try {
            var dc = getDeepestChild(element);
            var elementToDispatchEventFrom = dc.parentElement;
            let newEl;
            if (dc.nodeName.toLowerCase() == "br") {
                // Empty messenger field
                newEl = document.createElement("span");
                newEl.setAttribute("data-lexical-text", "true");
                dc.parentElement.appendChild(newEl);
                newEl.innerText = text;
            } else {
                // Field already has content
                dc.textContent = text;
                elementToDispatchEventFrom = elementToDispatchEventFrom.parentElement;
            }
            // Simulate user input
            elementToDispatchEventFrom.dispatchEvent(new InputEvent("input", { bubbles: true }));
            // Remove new element if it exists to prevent duplicates
            if (newEl) newEl.remove();
        } catch (error) {
            console.error('Facebook Update Error:', error);
            alert('Failed to update text in Facebook Messenger.');
        }
    }
}

function getDeepestChild(element) {
    if (element.lastChild) {
        return getDeepestChild(element.lastChild);
    } else {
        return element;
    }
}

// Helper function for handling native input values
function setNativeValue(element, value) {
    const valueSetter = Object.getOwnPropertyDescriptor(element.__proto__, 'value').set;
    const prototype = Object.getPrototypeOf(element);
    const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;
    
    if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
        prototypeValueSetter.call(element, value);
    } else if (valueSetter) {
        valueSetter.call(element, value);
    } else {
        throw new Error("The given element does not have a value setter");
    }
    
    element.dispatchEvent(new Event('input', { bubbles: true }));
}

// Listen for messages from popup or background
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    // Immediately send a response to keep the port open
    sendResponse({ received: true });
    
    // Use lastActiveElement if available, otherwise try lastFocusedElement
    // If both are null, use document.activeElement
    let activeElement = lastActiveElement || lastFocusedElement || document.activeElement;

    if (!activeElement || !isEditableElement(activeElement)) {
        // Send status back to popup or show alert
        chrome.runtime.sendMessage({
            type: 'STATUS_UPDATE',
            status: 'error',
            message: 'Please click or focus a text field first'
        });
        return;
    }

    // Store original selected text for cleanup later
    const selectedText = getSelectionText(activeElement);
    const textToProcess = selectedText || getElementText(activeElement);
    let instruction = '';

    switch(request.action) {
        case 'improveWriting':
            instruction = 'Improve this text';
            break;
        case 'makeFormal':
            instruction = 'Make this text more formal';
            break;
        case 'makeCreative':
            instruction = 'Make this text more creative';
            break;
        case 'custom':
            instruction = prompt('Enter your custom instruction:');
            if (!instruction) {
                chrome.runtime.sendMessage({
                    type: 'STATUS_UPDATE',
                    status: 'error',
                    message: 'No instruction provided'
                });
                return;
            }
            break;
    }
    
    // Store the full content before making changes
    const originalFullContent = getElementText(activeElement);
    
    // Provide visual feedback
    highlightElement(activeElement);
    
    // Handle the enhancement asynchronously
    (async () => {
        try {
            const result = await enhanceText(textToProcess, instruction);
            
            if (selectedText) {
                // Get the current full content again just before making changes
                const currentContent = getElementText(activeElement);
                
                // If we're in Gmail, handle the cleanup specially
                if (window.location.hostname.includes('mail.google.com')) {
                    const selection = window.getSelection();
                    if (selection.rangeCount > 0) {
                        const range = selection.getRangeAt(0);
                        range.deleteContents();
                        const textNode = document.createTextNode(result);
                        range.insertNode(textNode);
                        
                        // Cleanup step
                        setTimeout(() => {
                            const updatedContent = getElementText(activeElement);
                            if (updatedContent.includes(selectedText)) {
                                const cleanContent = updatedContent.replace(selectedText, '');
                                setElementText(activeElement, cleanContent);
                            }
                        }, 10);
                    }
                } else {
                    // Handle non-Gmail editors
                    setSelectionText(activeElement, result, selectedText);
                }
            } else {
                // If no selection, just replace everything
                setElementText(activeElement, result);
            }

            chrome.runtime.sendMessage({
                type: 'STATUS_UPDATE',
                status: 'success',
                message: 'Text enhanced successfully'
            });
        } catch (error) {
            chrome.runtime.sendMessage({
                type: 'STATUS_UPDATE',
                status: 'error',
                message: error.message
            });
        } finally {
            removeHighlight(activeElement);
        }
    })();
});

function showLoadingIndicator(element) {
    if (!element) return () => {}; // Guard clause for invalid elements

    const originalText = getElementText(element);
    let dots = '';
    
    const loadingDots = setInterval(() => {
        if (!isProcessing) {
            clearInterval(loadingDots);
            return;
        }
        dots = dots.length >= 3 ? '' : dots + '.';
        if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
            setNativeValue(element, 'Processing' + dots);
        } else if (element.isContentEditable || element.getAttribute('contenteditable') === 'true') {
            element.innerText = 'Processing' + dots;
        }
    }, 500);

    return function cleanup() {
        clearInterval(loadingDots);
        if (element) {  // Check if element still exists
            if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
                setNativeValue(element, originalText);
            } else if (element.isContentEditable || element.getAttribute('contenteditable') === 'true') {
                element.innerText = originalText;
            }
        }
    };
}

// Update enhanceText function
async function enhanceText(text, instruction) {
    if (isProcessing) {
        throw new Error('Please wait for the current request to complete');
    }

    let resetLoading = null;
    try {
        isProcessing = true;
        const { apiKey } = await new Promise((resolve) => {
            chrome.storage.local.get(['apiKey'], resolve);
        });
        if (!apiKey) {
            throw new Error('Please enter your Claude API key in the extension popup');
        }

        resetLoading = showLoadingIndicator(lastActiveElement);

        // Create a port for reliable communication
        const port = chrome.runtime.connect({name: "status-channel"});
        
        const result = await new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                type: 'CLAUDE_API_REQUEST',
                apiKey: apiKey,
                content: text,
                instruction: instruction // Include instruction
            }, response => {
                if (chrome.runtime.lastError) {
                    port.postMessage({type: 'error', message: chrome.runtime.lastError.message});
                    reject(new Error(chrome.runtime.lastError.message));
                    return;
                }
                if (response.error) {
                    port.postMessage({type: 'error', message: response.error});
                    reject(new Error(response.error));
                } else {
                    port.postMessage({type: 'success', message: 'Text enhanced successfully'});
                    resolve(response.data);
                }
            });
        });

        return result;
    } catch (error) {
        console.error('Content Script Error:', error);
        chrome.runtime.sendMessage({
            type: 'STATUS_UPDATE',
            status: 'error',
            message: error.message
        });
        throw error;
    } finally {
        isProcessing = false;
        if (resetLoading) resetLoading();
    }
}

// Visual feedback functions
function highlightElement(element) {
    if (!element) return;
    element.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.7)';
}

function removeHighlight(element) {
    if (!element) return;
    element.style.boxShadow = '';
}