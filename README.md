# TWISE Night Feedback System

A real-time feedback collection and analysis system for TWISE Night research activities, featuring sentiment analysis and live dashboard visualization.

## 🌐 Live Demo

- [Feedback Form](https://twise-feedback-xwyu.vercel.app/) - For participants to submit feedback
- [Admin Dashboard](https://twise-feedback-z8g2.vercel.app/admin) - Real-time analytics and feedback monitoring
- [QR Code Generator](https://twise-feedback-xwyu.vercel.app/qr) - Generate QR codes for easy access

## ✨ Features

- Real-time feedback collection
- Sentiment analysis of participant responses
- Live dashboard with data visualization
- QR code generation for easy access
- Mobile-responsive design
- Multi-language support

## 🛠️ Technologies Used

### Frontend
- Next.js 14 (App Router)
- React
- Tailwind CSS
- Recharts for data visualization
- Lucide React for icons

### Backend
- Firebase Realtime Database
- Python Flask (Sentiment Analysis)
- Next.js API Routes

### Development & Deployment
- TypeScript
- Vercel
- Git/GitHub

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Python 3.8+

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/twise-feedback.git
cd twise-feedback
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file with your Firebase configuration:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_database_url
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Python Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Start the Flask server:
```bash
python app.py
```

## 📱 Usage

1. **Feedback Form** (`/`): Participants can:
   - Select activities they attended
   - Rate their experience
   - Provide detailed feedback
   - See real-time sentiment analysis of their feedback

2. **Admin Dashboard** (`/admin`): Organizers can view:
   - Total participation metrics
   - Average ratings per activity
   - Sentiment distribution
   - Real-time feedback stream

3. **QR Code** (`/qr`): Generate QR codes for:
   - Quick access to feedback form
   - Specific activities
   - Event information

## 🔄 Deployment

The project is configured for easy deployment on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- @sambett
- Association REACT

## 🙏 Acknowledgments

- TWISE Night organizers
- All participants who provided feedback
- Vercel for hosting
- Firebase for real-time database
