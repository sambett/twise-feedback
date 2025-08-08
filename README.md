# 🚀 TWISE Universal Feedback Platform

> **Migration Complete**: Successfully migrated from Firebase to MySQL local database

A powerful, AI-enhanced feedback collection platform with real-time analytics and sentiment analysis. Built with Next.js frontend and Express.js backend, powered by local MySQL database.

## 🎯 Quick Start

### Option 1: Easy Launch (Recommended)
1. **Double-click** `run_full_stack.bat` - This will:
   - Check database connection
   - Install dependencies
   - Start both frontend and backend
   - Open your browser automatically

### Option 2: Manual Setup
1. **Setup Database**: Double-click `setup_database.bat`
2. **Run Application**: Double-click `run_full_stack.bat`

## 📋 Prerequisites

- **MySQL Server** (running on localhost:3306)
  - XAMPP, WAMP, or standalone MySQL
  - MySQL91 service should be running
- **Node.js** 20+ and npm 10+
- **Database Credentials** in `backend/.env.local`:
  ```env
  DB_HOST=localhost
  DB_PORT=3306
  DB_USER=root
  DB_PASSWORD=''
  DB_NAME=twise_feedback
  ```

## 🗄️ Database Setup

The platform uses **MySQL database** with the following structure:

### Events Table
- `id` (VARCHAR) - Primary key
- `title`, `subtitle` - Event information
- `activities` (JSON) - Available activity options
- `theme` (JSON) - Custom styling
- `activity_label`, `feedback_label`, `feedback_placeholder` - Custom labels
- `is_custom` (BOOLEAN) - Whether event is user-created
- Timestamps: `created_at`, `updated_at`

### Feedback Table
- `id` (AUTO_INCREMENT) - Primary key
- `feedback_id` (VARCHAR) - Unique identifier
- `event_id` (VARCHAR) - Foreign key to events
- `star_rating` (1-5) - Rating score
- `activity` - Selected activity
- `comment` - User feedback text
- `user_name`, `user_email` - Optional user info
- **AI Fields**: `sentiment`, `sentiment_score`, `sentiment_confidence`, `language`
- `processing_time` - AI processing duration
- `timestamp` - When feedback was submitted

## 🔧 Available Scripts

### Backend Scripts (in `backend/` folder)
```bash
npm run dev              # Start development server
npm run setup-db         # Create database and tables
npm run test-db          # Test database connection
npm run demo-data        # Generate sample feedback data
npm run verify-setup     # Full database verification
```

### Frontend Scripts (in main folder)
```bash
npm run dev              # Start Next.js development server
npm run full:dev         # Start both frontend and backend
npm run backend:dev      # Start only backend
npm run backend:setup    # Setup backend database
```

### Batch Files (Windows)
- `run_full_stack.bat` - Start complete application
- `setup_database.bat` - Database setup wizard
- `backend/run_local.bat` - Backend only with DB check

## 🌐 Application URLs

Once running, access these endpoints:

- **🏠 Main App**: http://localhost:3000
- **👑 Admin Dashboard**: http://localhost:3000/admin
- **📊 Backend API**: http://localhost:3001
- **❤️ Health Check**: http://localhost:3001/health
- **📚 API Documentation**: http://localhost:3001/api

### Example Event URLs
- **TWISE Event**: http://localhost:3000/event/twise-night
- **Sample Event**: http://localhost:3000/event/sample-research-event

## 🎮 Key Features

### ✅ **Already Working**
- ✅ **MySQL Database**: Local persistent storage
- ✅ **Event Management**: Create, edit, delete custom events
- ✅ **Feedback Collection**: Star ratings + comments
- ✅ **Local AI Sentiment Analysis**: No API keys required
- ✅ **Real-time Analytics**: Live dashboard updates
- ✅ **Multi-language Support**: Auto-detect language
- ✅ **QR Code Generation**: For easy event sharing
- ✅ **Responsive Design**: Works on all devices
- ✅ **Custom Themes**: Multiple color schemes

### 🔥 **AI Powered**
- **Sentiment Analysis**: Automatic positive/neutral/negative detection
- **Confidence Scoring**: AI confidence levels for each analysis
- **Language Detection**: Supports 12+ languages
- **Processing Metrics**: Track AI performance

### 📊 **Analytics Dashboard**
- **Real-time Updates**: Live feedback streaming
- **Sentiment Breakdown**: Visual sentiment distribution
- **Activity Analysis**: Performance by activity type
- **Rating Distribution**: Star rating analytics
- **Time-based Trends**: 24h/7d/30d analysis

## 🛠️ Troubleshooting

### Database Connection Issues
1. **Check MySQL Service**:
   ```cmd
   net start MySQL91
   ```

2. **Verify Credentials**: Check `backend/.env.local`

3. **Test Connection**:
   ```cmd
   cd backend
   node test-database.js
   ```

### Common Solutions
- **Port Conflicts**: Change ports in `.env.local`
- **Missing Tables**: Run `npm run setup-db`
- **No Demo Data**: Run `npm run demo-data`
- **CORS Issues**: Check `CORS_ORIGIN` in backend `.env.local`

## 📁 Project Structure

```
twise/
├── app/                    # Next.js frontend
│   ├── admin/             # Admin dashboard pages
│   ├── event/[eventId]/   # Public feedback forms
│   ├── lib/               # API client and utilities
│   └── components/        # React components
├── backend/               # Express.js backend
│   ├── config/           # Database configuration
│   ├── routes/           # API endpoints
│   ├── services/         # Business logic (AI, etc.)
│   ├── init.sql          # Database setup script
│   ├── setup-database.js # Database initialization
│   ├── test-database.js  # Connection testing
│   └── generate-demo-data.js # Sample data generator
├── run_full_stack.bat    # Main launcher
├── setup_database.bat    # Database setup wizard
└── README.md
```

## 🔄 Migration Notes

### ✅ **Successfully Migrated from Firebase**
- **Database**: Firebase Realtime DB → MySQL
- **Authentication**: Removed (using local-only setup)
- **Hosting**: Firebase Hosting → Local development
- **Data Structure**: Preserved event and feedback schemas
- **Analytics**: Enhanced with SQL-based analytics

### 🗑️ **Removed Firebase Dependencies**
- Cleaned up all Firebase imports and configurations
- Removed Firebase SDK dependencies
- Updated TypeScript interfaces
- Replaced Firebase demo data with MySQL version

## 🚀 Production Deployment

When ready for production:

1. **Database**: Set up MySQL on production server
2. **Environment**: Update backend `.env.local` with production credentials
3. **Build**: Run `npm run build` in main folder
4. **Deploy**: Use PM2, Docker, or your preferred deployment method

## 📞 Support

### 🛠️ **For Issues**
1. Check database connection: `npm run test-db`
2. Verify setup: `npm run verify-setup`
3. Review logs in terminal output
4. Check MySQL service status

### 🎯 **For Development**
- Backend API docs: http://localhost:3001/api
- Health monitoring: http://localhost:3001/health
- Metrics: http://localhost:3001/api/metrics

---

**🎉 Ready to collect feedback with AI-powered insights!**

> **Note**: This is a complete, working application with local MySQL database. No external APIs or Firebase accounts required.
