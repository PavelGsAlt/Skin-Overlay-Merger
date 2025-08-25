# Minecraft Skin Overlay Merger

A client-side web application for merging Minecraft skins with overlays using a simple ZIP file system. All processing happens in your browser - no uploads needed!

## ✨ Features

- **Client-side Processing**: No server uploads, all processing happens in your browser
- **Drag & Drop Support**: Easy file upload with drag and drop functionality  
- **3D Preview**: Interactive 3D skin viewer powered by SkinView3D and Three.js
- **ZIP Overlay System**: Browse overlays from a single ZIP file with automatic extraction
- **Individual Preview**: Preview base skins and overlays separately in 3D
- **Skin Type Support**: Automatic detection of slim/normal skin variants
- **Auto-resize**: Automatically resize overlays to match base skin dimensions
- **Download Ready**: Instant download of merged skins

## 🚀 Quick Start

1. **Upload Base Skin**: Click or drag & drop your main Minecraft skin (64×64 PNG recommended)
2. **Upload Overlay**: Add your overlay/accessory PNG file  
3. **Preview in 3D**: Check how your skin looks before finalizing
4. **Merge & Download**: Click the merge button to download your combined skin

## 🌐 Live Demo

Visit: [https://pavelgsalt.github.io](https://pavelgsalt.github.io)

<!-- Force rebuild: 2025-08-25 -->

## 🛠️ Development

### Prerequisites
- Node.js 16+ (for development server)
- Modern web browser with JavaScript enabled

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/PavelGsAlt/pavelgsalt.github.io.git
cd pavelgsalt.github.io
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts

- `npm run start` - Start production server
- `npm run dev` - Start development server on port 3000
- `npm run deploy` - Deploy to GitHub Pages

## 📁 Project Structure

```
├── index.html          # Main HTML file
├── main.js             # React application entry point
├── overlay-config.js   # ZIP overlay configuration
├── overlay-service.js  # ZIP extraction and overlay service
├── styles.css          # Main stylesheet
├── styles/
│   ├── globals.css     # Global styles
│   └── minecraft-skin.css # Minecraft-specific styles
├── Overlays.zip        # ZIP file containing all overlays
└── OVERLAYS-ZIP-STRUCTURE.md # ZIP structure guide
```

## 🎨 Technologies Used

- **React 18** (via CDN)
- **Three.js** - 3D graphics library
- **SkinView3D** - Minecraft skin 3D viewer
- **JSZip** - Client-side ZIP file extraction
- **Vanilla CSS** - Custom styling with modern utilities

## 🔧 Configuration

### ZIP Overlay System

The app uses a simple ZIP file system for overlays. See [OVERLAYS-ZIP-STRUCTURE.md](OVERLAYS-ZIP-STRUCTURE.md) for detailed structure requirements.

Quick setup:
1. Create overlay folders with PNG files for each overlay
2. Structure folders with `slim.png` and `normal.png` for each overlay
3. ZIP all overlay folders into `Overlays.zip`
4. Place `Overlays.zip` in your website root directory

Example ZIP structure:
```
Overlays.zip
├── wizard_hat/
│   ├── slim.png
│   └── normal.png
├── cool_glasses/
│   ├── slim.png
│   └── normal.png
└── red_cape/
    ├── slim.png
    └── normal.png
```

### File Requirements

- **ZIP file**: Must be named `Overlays.zip` in website root
- **Structure**: Each overlay in its own folder
- **Files**: `slim.png` and `normal.png` for each overlay
- **Format**: PNG files only, max 10MB per file
- **Total size**: Max 100MB for entire ZIP file

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [SkinView3D](https://github.com/bs-community/skinview3d) - 3D Minecraft skin viewer
- [Three.js](https://threejs.org/) - 3D graphics library
- [Lucide Icons](https://lucide.dev/) - Beautiful icon set
- [Tiago Augusto (tiagoadag1203)](https://github.com/tiagoadag1203) - Animated search input component (MIT License)
- OR Feed community for inspiration and overlay resources

## 🐛 Known Issues

- Large overlay files may take a moment to process
- 3D viewer requires WebGL support
- ZIP file must be accessible from website root
- Large ZIP files (>50MB) may take time to download and extract

## 📞 Support

If you encounter issues or have questions:

1. Check the [Issues](https://github.com/PavelGsAlt/pavelgsalt.github.io/issues) page
2. Create a new issue with detailed information
3. Include browser version and error messages if applicable

---

Made with ❤️ for the OR Feed Community

<!-- Last updated: 2025-08-25 -->
