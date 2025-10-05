# Mavrix's Survey Tool

A professional survey platform built with React and NestJS, featuring advanced question logic, multi-language support, and real-time analytics.

## 🚀 Features

- **Advanced Question Builder** - Create complex surveys with skip logic and validation
- **Multi-Language Support** - Auto-translation with Google Translate API
- **Template System** - Reusable question templates for faster survey creation
- **Real-Time Analytics** - Live response tracking and visualization
- **Country-Based Logic** - Skip questions based on respondent location
- **Professional UI** - Modern glassmorphism design with mavrik's branding
- **Responsive Design** - Works seamlessly on all devices

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Chart.js** - Data visualization
- **Google Translate API** - Auto-translation

### Backend
- **NestJS** - Node.js framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **Swagger** - API documentation
- **Passport** - Authentication middleware

##  Docker Files details

## How to Run:

- **Start all services**:docker-compose up -d
- **View logs**:docker-compose logs -f
- **Stop all services:**:docker-compose down


- **Port Deails**

- **Frontend:** http://localhost:3000

- **Backend API:** http://localhost:8000

- **MongoDB:** localhost:27017


## 📦 Installation

### Prerequisites
- Node.js 16+
- MongoDB
- npm or yarn

### Quick Start

1. **Clone the repository**
```bash
git clone <repository-url>
cd pre_screener_tool
```

2. **Install dependencies**
```bash
# Install frontend dependencies
cd screener-portal-new
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. **Start MongoDB**
```bash
mongod
```

4. **Run the application**
```bash
# From the frontend directory
cd screener-portal-new
npm run dev
```

This will start both frontend (http://localhost:3000) and backend (http://localhost:8000) simultaneously.

## 🔧 Configuration

### Environment Variables

Create `.env` files in both directories:

**Backend (.env)**
```env
MONGODB_URI=mongodb://localhost:27017/projectdb
JWT_SECRET=your-jwt-secret-key
PORT=8000
```

**Frontend (.env)**
```env
REACT_APP_API_URL=http://localhost:8000
```

## 📚 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/api
- **API Base URL**: http://localhost:8000

### Key Endpoints

- `POST /auth/login` - User authentication
- `GET /projects` - List all projects
- `POST /projects` - Create new project
- `GET /projects/public/:code` - Get public survey
- `POST /respondents/public` - Submit survey response
- `GET /templates` - List question templates

## 🎨 Features Overview

### Survey Creation
- Drag-and-drop question builder
- Multiple question types (Single/Multi-select, Open-ended)
- Skip logic based on country
- Auto-translation to 35+ languages
- Template library for common questions

### Response Collection
- Public survey links
- Real-time response validation
- Qualification/termination logic
- Progress tracking
- Mobile-responsive survey interface

### Analytics Dashboard
- Response statistics by country
- Completion rates
- Real-time charts
- Export capabilities

## 🏗️ Project Structure

```
pre_screener_tool/
├── backend/                 # NestJS backend
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── projects/       # Project management
│   │   ├── respondents/    # Response handling
│   │   └── templates/      # Question templates
│   └── package.json
├── screener-portal-new/    # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── utils/          # Utilities & helpers
│   │   └── context/        # React context
│   └── package.json
└── README.md
```

## 🚀 Deployment

### Frontend (Netlify/Vercel)
```bash
cd screener-portal-new
npm run build
# Deploy the build/ folder
```

### Backend (Heroku/Railway)
```bash
cd backend
npm run build
# Deploy with your preferred service
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Email: support@mavrix-surveys.com

## 🙏 Acknowledgments

- Built with ❤️ by Mavrix's Team
- Icons by Emoji
- UI inspiration from modern survey platforms

---

**Mavrix's Survey Tool** - Professional survey platform for the modern web.