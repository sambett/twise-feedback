# Universal Feedback Platform

> **🌟 Live Demo**: https://sambett.github.io/twise-feedback/admin

A real-time feedback and sentiment analysis platform for events.

## 🌐 Live Demo URLs

### **🎯 Perfect for Presentations:**
| Demo | URL | Description |
|------|-----|-------------|
| **Admin Dashboard** | https://sambett.github.io/twise-feedback/admin | 🏠 Universal overview |
| **Wedding Form** | https://sambett.github.io/twise-feedback/event/sam-wedding | 💒 Elegant theme |
| **Wedding Dashboard** | https://sambett.github.io/twise-feedback/admin/sam-wedding | 📊 Real-time analytics |
| **Product Demo** | https://sambett.github.io/twise-feedback/event/techflow-demo | 💼 Corporate theme |
| **TWISE Dashboard** | https://sambett.github.io/twise-feedback/admin/twise-night | 🔬 Research theme |

### **🔗 Quick Access:**
**Main Demo**: https://sambett.github.io/twise-feedback/admin

### **Local Development**
- **Admin Dashboard**: http://localhost:3000/admin
- **Wedding Event**: http://localhost:3000/event/sam-wedding
- **Wedding Dashboard**: http://localhost:3000/admin/sam-wedding
- **Product Demo**: http://localhost:3000/event/techflow-demo
- **TWISE Dashboard**: http://localhost:3000/admin/twise-night

## 🚀 Quick Start

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/sambett/twise-feedback.git
   cd twise-feedback
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Firebase credentials
   ```

4. **Start the platform**:
   ```bash
   # Option 1: Use the launcher
   start.bat
   
   # Option 2: Manual start
   npm run dev
   ```

5. **Open demo**:
   ```bash
   # After server is running
   demo.bat
   ```

## 🎯 Demo Flow

### **Perfect Presentation Sequence:**
1. **Start with Admin Dashboard** → Show universal concept
2. **Open Wedding Form** → Demonstrate elegant theme
3. **View Wedding Dashboard** → Show real-time analytics
4. **Open Product Demo** → Prove corporate versatility
5. **View TWISE Dashboard** → Show research theme

### **Local Demo:**
```bash
start.bat  # Start server
demo.bat   # Open all URLs
```

### **Production Demo:**
Visit the GitHub Pages URLs above - same experience as local demo!

## 📁 Project Structure

```
├── app/                    # Next.js application
│   ├── admin/             # Admin dashboards
│   ├── event/             # Event feedback forms
│   ├── api/               # API endpoints
│   └── lib/               # Utilities
├── backend/               # Python Flask backend
├── start.bat              # Quick launcher
├── demo.bat               # Demo URL opener
└── __TO_DELETE__/         # Archived files
```

## 🚀 Deployment

### **GitHub Pages (Current)**
This repository is configured for automatic deployment to GitHub Pages. Every push to the `main` branch automatically deploys to:
**https://sambett.github.io/twise-feedback**

### **Deploy to Other Platforms**

#### **Vercel**
```bash
npm i -g vercel
vercel --prod
```

#### **Firebase Hosting**
```bash
npm i -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

## 🔧 Commands

- `start.bat` - Install dependencies and start server
- `demo.bat` - Open demo URLs (requires server running)
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server

## 🐍 Backend (Optional)

The Python backend provides enhanced sentiment analysis:

```bash
cd backend
pip install -r requirements.txt
python app.py
```

## 📊 Key Features

- **Real-time Analytics**: Live sentiment analysis
- **Multi-theme Support**: Wedding, corporate, research themes
- **Responsive Design**: Works on all devices
- **Firebase Integration**: Real-time database
- **QR Code Generation**: Easy event access

## 🎨 Customization

To add new event types, update `app/lib/eventConfigs.ts` and add theme styles to `app/globals.css`.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

---

**🌟 Ready to demo? Use the GitHub Pages URLs above for live presentations!**

**Local**: Run `start.bat` then `demo.bat`  
**Production**: Use the live URLs above - same experience!

**Repository**: https://github.com/sambett/twise-feedback