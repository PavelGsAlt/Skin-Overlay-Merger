# Minecraft Skin Overlay Merger

A client-side web application for merging Minecraft skins with overlays. All processing happens in your browser - no uploads needed!

## ✨ Features

- **Client-side Processing**: No server uploads, all processing happens in your browser
- **Drag & Drop Support**: Easy file upload with drag and drop functionality  
- **3D Preview**: Interactive 3D skin viewer powered by SkinView3D and Three.js
- **GitHub Integration**: Browse community overlays from GitHub repositories
- **Auto-resize**: Automatically resize overlays to match base skin dimensions
- **Download Ready**: Instant download of merged skins

## 🚀 Quick Start

1. **Upload Base Skin**: Click or drag & drop your main Minecraft skin (64×64 PNG recommended)
2. **Upload Overlay**: Add your overlay/accessory PNG file  
3. **Merge & Download**: Click the merge button to download your combined skin

## 🌐 Live Demo

Visit: [https://pavelgsalt.github.io](https://pavelgsalt.github.io)

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
├── styles.css          # Main stylesheet
├── styles/
│   ├── globals.css     # Global styles
│   └── minecraft-skin.css # Minecraft-specific styles
├── netlify/
│   └── functions/
│       └── github-proxy.js # GitHub API proxy for CORS
└── Overlays/           # Sample overlay files
```

## 🎨 Technologies Used

- **React 18** (via CDN)
- **Three.js** - 3D graphics library
- **SkinView3D** - Minecraft skin 3D viewer
- **Netlify Functions** - Serverless backend for GitHub API
- **Vanilla CSS** - Custom styling with Tailwind-inspired utilities

## 🔧 Configuration

### GitHub Integration

The app can browse overlays from GitHub repositories. To add your own repository:

1. Create an `Overlays` folder in your repository root
2. Add subfolders for different overlay categories
3. Place PNG files in the subfolders
4. The app will automatically detect and display them

Example structure:
```
your-repo/
└── Overlays/
    ├── Hats/
    │   ├── cool_hat.png
    │   └── winter_hat.png
    └── Accessories/
        ├── glasses.png
        └── necklace.png
```

### Netlify Functions

For GitHub API integration, configure environment variables:
- `GITHUB_TOKEN` (optional) - GitHub personal access token for higher rate limits

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
- Minecraft community for inspiration and overlay resources

## 🐛 Known Issues

- Large overlay files may take a moment to process
- 3D viewer requires WebGL support
- GitHub API has rate limits for unauthenticated requests

## 📞 Support

If you encounter issues or have questions:

1. Check the [Issues](https://github.com/PavelGsAlt/pavelgsalt.github.io/issues) page
2. Create a new issue with detailed information
3. Include browser version and error messages if applicable

---

Made with ❤️ for the Origin Realms community
