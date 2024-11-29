# Clarif.AI - Text Enhancement Chrome Extension

A powerful Chrome extension that uses Claude AI to enhance text in any editable field. Whether you're writing emails, documents, or social media posts, Clarif.AI helps improve your writing with just a few clicks.

## Features

- 🚀 **One-Click Enhancement**: Improve any text with a single click
- ✍️ **Multiple Enhancement Modes**:
  - Improve Writing: General text improvement
  - Make Formal: Convert casual text to professional tone
  - Make Creative: Add creative flair to your writing
  - Custom Style: Define your own enhancement instructions
- 📝 **Smart Selection**: Works with both full text and selected portions
- 🌐 **Wide Compatibility**:
  - Gmail Composer
  - Google Docs
  - Social Media Platforms
  - Any editable text field
- ⌨️ **Keyboard Shortcuts**:
  - `Cmd+Shift+E` (Mac) / `Ctrl+Shift+E` (Windows): Quick improve
  - `Cmd+Shift+T` (Mac) / `Ctrl+Shift+T` (Windows): Open popup

## Installation

### From Source
1. Clone this repository:
   ```bash
   git clone https://github.com/ccollier86/clarif-ai.git
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" in the top right

4. Click "Load unpacked" and select the extension directory

### Configuration
1. Get a Claude API key from [Anthropic](https://www.anthropic.com/)
2. Click the Clarif.AI extension icon
3. Enter your API key in the popup
4. Start enhancing your text!

## Usage

### Basic Usage
1. Click into any text field
2. Either:
   - Select specific text to enhance, or
   - Leave unselected to enhance entire field
3. Click the Clarif.AI icon and choose an enhancement option
4. Watch your text transform!

### Keyboard Shortcuts
Default shortcuts are:
- `Cmd+Shift+E` (Mac) / `Ctrl+Shift+E` (Windows) to quickly improve text
- `Cmd+Shift+T` (Mac) / `Ctrl+Shift+T` (Windows) to open the popup

If the default shortcuts aren't working or you'd like to customize them:
1. Go to `chrome://extensions` in your browser
2. Click the "hamburger menu" (three lines) in the top left
3. Select "Keyboard Shortcuts" from the menu
4. Find "Clarif.AI" in the list
5. Click the pencil icon next to the shortcut you want to modify
6. Press your desired key combination
7. Choose between:
   - "In Chrome" (works only when Chrome is focused)
   - "Global" (works even when Chrome isn't focused)
8. Click "OK" to save

Note: Some keyboard combinations might be reserved by your system or other extensions. If a shortcut isn't working, try setting a different combination in the keyboard shortcuts settings.

### Context Menu
Right-click on any text field to access Clarif.AI options directly from the context menu.

## Development

### Prerequisites
- Chrome browser
- Claude API key from Anthropic

### Project Structure
```
clarif-ai/
├── manifest.json        # Extension configuration
├── background.js       # Background service worker
├── content.js         # Content script for text manipulation
├── popup.html        # Extension popup interface
├── popup.js         # Popup functionality
└── icons/          # Extension icons
```

### Building
No build process required - this extension runs directly from source.

### Testing
1. Load the extension in Chrome
2. Test in various text editors:
   - Regular text fields
   - Rich text editors (Gmail, Google Docs)
   - Social media inputs
   - Content management systems

## Privacy & Security
- All text processing is done via Claude API
- API keys are stored locally in Chrome storage
- No data is collected or stored externally
- All communication is encrypted via HTTPS

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License
This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments
- Built with [Claude API](https://www.anthropic.com/)

## Support
If you're having issues:
1. Check the [Issues](https://github.com/ccollier86/clarif-ai/issues) page
2. Submit a new issue if yours isn't listed
3. Include Chrome version and steps to reproduce

## Roadmap
- [ ] Custom enhancement templates
- [ ] History of enhancements
- [ ] Style consistency settings
- [ ] Advanced Improvment Mode