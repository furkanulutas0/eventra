# 📅 Eventra - Smart Event Scheduling Platform

> A modern, full-stack event scheduling application that simplifies meeting coordination through intelligent time slot voting and availability management.

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)

## 🌟 Features

### 🎯 Core Functionality
- **Two Event Types**:
  - **1:1 Events**: Individual scheduling with direct booking (max 10 time slots)
  - **Group Events**: Multi-participant voting system with flexible options
- **Smart Time Slot Management**: Automatic conflict detection and validation
- **Anonymous Participation**: Optional anonymous voting for privacy
- **Real-time Voting**: Live vote tracking and statistics
- **Email Notifications**: Automated confirmation and completion emails
- **Calendar Integration**: Export to Google, Outlook, and Apple Calendar

### 🔐 User Management
- Secure authentication with Supabase
- User profiles and dashboard
- Event creation and management
- Participant tracking and analytics

### 📊 Analytics & Insights
- Interactive vote distribution charts
- Real-time participation statistics
- Event completion tracking
- Comprehensive participant management

### 🎨 Modern UI/UX
- Responsive design with Tailwind CSS
- Dark/light theme support
- Mobile-optimized interface
- Intuitive user workflows

## 🏗️ Architecture

### Frontend (React + TypeScript)
```
client/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── modals/       # Modal dialogs
│   │   ├── charts/       # Data visualization
│   │   └── ui/           # Base UI components
│   ├── pages/            # Route-based pages
│   │   ├── auth/         # Authentication
│   │   ├── dashboard/    # User dashboard
│   │   ├── event/        # Event management
│   │   └── profile/      # User profile
│   ├── api/              # API client functions
│   ├── redux/            # State management
│   └── lib/              # Utilities and configs
```

### Backend (Node.js + Express + TypeScript)
```
api/
├── controllers/          # Request handlers
│   ├── auth/            # Authentication logic
│   ├── event/           # Event management
│   └── user/            # User operations
├── services/            # Business logic
│   ├── email.service.ts # Email notifications
│   └── mail/            # Mail utilities
├── templates/           # Email templates
├── routes/              # API route definitions
└── utils/               # Middleware and utilities
```

### Database (Supabase/PostgreSQL)
- **Users**: Authentication and profiles
- **Events**: Event metadata and configuration
- **Event Dates**: Available dates for events
- **Event Time Slots**: Specific time slots per date
- **Event Participants**: Participant information
- **Participant Availability**: Vote/availability tracking

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/furkanulutas0/eventra.git
   cd eventra
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install client dependencies
   cd client && npm install && cd ..
   ```

3. **Environment Setup**
   
   Create `.env` file in the root directory:
   ```env
   # Supabase Configuration
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   
   # Email Service (Resend)
   RESEND_API_KEY=your_resend_api_key
   
   # Application
   PORT=3000
   FRONTEND_URL=http://localhost:5173
   ```

4. **Database Setup**
   
   Run the SQL schema from `client/src/lib/db.sql` in your Supabase SQL editor.

5. **Start Development Servers**
   ```bash
   # Start backend (http://localhost:3000)
   npm run dev
   
   # Start frontend (http://localhost:5173) - in a new terminal
   cd client && npm run dev
   ```

### Production Build
```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📋 API Reference

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Event Management
- `POST /api/event/createEvent` - Create new event
- `GET /api/event/getEventDataById` - Get event details
- `GET /api/event/getEventsByUser` - Get user's events
- `PATCH /api/event/updateStatus` - Update event status
- `DELETE /api/event/deleteEvent/:id` - Delete event

### Participation
- `POST /api/event/submitAvailability` - Submit time slot votes
- `DELETE /api/event/deleteParticipantAvailability` - Remove participation

## 🧪 Testing

The project includes comprehensive boundary value testing:

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run coverage report
npm run test:coverage

# Run boundary value tests
npm run test:boundary

# Watch boundary tests
npm run test:boundary:watch
```

### Test Coverage
- **Email Validation**: Format validation with boundary conditions
- **Event Validation**: Creation and update validation rules
- **Time Validation**: Time slot conflicts and constraints
- **API Endpoints**: Request/response validation
- **Utility Functions**: Edge cases and boundary values

## 🔧 Configuration

### Event Types

#### 1:1 Events
- Maximum 10 time slots per event
- First-come, first-served booking
- 30-minute minimum gap between slots
- Direct booking without voting

#### Group Events
- Unlimited time slots
- Voting-based scheduling
- Optional anonymous participation
- Multiple vote selection (configurable)

### Email Templates
- **Vote Confirmation**: Sent after successful participation
- **Event Completion**: Sent when events are finalized
- Customizable HTML templates with branding

### Time Slot Validation
- Past time prevention
- Conflict detection
- Minimum duration enforcement
- Maximum capacity limits

## 🛠️ Technology Stack

### Frontend
- **React 18.3** - UI framework
- **TypeScript 5.6** - Type safety
- **Vite 6.0** - Build tool and dev server
- **Tailwind CSS 3.4** - Styling framework
- **Radix UI** - Accessible component primitives
- **Redux Toolkit** - State management
- **React Router 7.1** - Client-side routing
- **React Hot Toast/Sonner** - Notifications
- **Recharts** - Data visualization
- **Date-fns** - Date manipulation
- **Lucide React** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **tsx** - TypeScript execution
- **Nodemon** - Development server

### Database & Services
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Primary database
- **Resend** - Email service
- **Supabase Auth** - Authentication

### Development Tools
- **ESLint** - Code linting
- **Vitest** - Testing framework
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

## 📦 Project Structure

```
eventra/
├── 📁 api/                    # Backend application
│   ├── 📁 controllers/        # Request handlers
│   ├── 📁 routes/            # API routes
│   ├── 📁 services/          # Business logic
│   ├── 📁 templates/         # Email templates
│   ├── 📁 utils/             # Utilities & middleware
│   └── 📄 index.ts           # Server entry point
├── 📁 client/                 # Frontend application
│   ├── 📁 public/            # Static assets
│   ├── 📁 src/               # Source code
│   │   ├── 📁 components/    # React components
│   │   ├── 📁 pages/         # Page components
│   │   ├── 📁 api/           # API client
│   │   ├── 📁 redux/         # State management
│   │   └── 📁 lib/           # Utilities
│   └── 📄 package.json       # Frontend dependencies
├── 📁 tests/                  # Test suite
│   ├── 📁 boundary-value/    # Boundary value tests
│   └── 📁 utils/             # Test utilities
├── 📄 package.json           # Root dependencies
├── 📄 tsconfig.json          # TypeScript config
└── 📄 README.md              # This file
```

## 🔄 Development Workflow

### Available Scripts

```bash
# Development
npm run dev              # Start backend in development mode
npm run start            # Start backend in production mode

# Building
npm run build            # Build entire application
cd client && npm run build  # Build frontend only

# Testing
npm test                 # Run all tests
npm run test:ui          # Run tests with UI
npm run test:coverage    # Generate coverage report
npm run test:boundary    # Run boundary value tests

# Linting
npm run lint             # Lint entire codebase
cd client && npm run lint    # Lint frontend only
```

### Development Tips

1. **Environment Variables**: Ensure all required environment variables are set
2. **Database Schema**: Keep `db.sql` updated with schema changes
3. **Type Safety**: Maintain TypeScript interfaces for API contracts
4. **Testing**: Add boundary value tests for new features
5. **Email Templates**: Test email templates in development

## 🚀 Deployment

### Render.com (Recommended)
The project is configured for Render.com deployment:

1. **Build Command**: `npm run build`
2. **Start Command**: `npm start`
3. **Environment Variables**: Set all required env vars in Render dashboard
4. **Auto-Deploy**: Connected to GitHub for automatic deployments

### Environment Variables for Production
```env
SUPABASE_URL=your_production_supabase_url
SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_key
RESEND_API_KEY=your_production_resend_key
FRONTEND_URL=https://your-domain.com
PORT=3000
```

### Manual Deployment
```bash
# Build the application
npm run build

# Set environment variables
export NODE_ENV=production
export PORT=3000
# ... other env vars

# Start the server
npm start
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Add tests for new features
- Update documentation
- Ensure responsive design
- Test email functionality

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/furkanulutas0/eventra/issues) page
2. Review the documentation
3. Create a new issue with detailed information

## 🎯 Roadmap

### Upcoming Features
- [ ] **Calendar Integration**: Two-way sync with external calendars
- [ ] **Time Zone Support**: Multi-timezone event scheduling
- [ ] **Recurring Events**: Support for recurring meetings
- [ ] **Advanced Analytics**: More detailed participation insights
- [ ] **Mobile App**: Native mobile applications
- [ ] **Team Management**: Organization and team features
- [ ] **Custom Branding**: White-label customization options
- [ ] **API Webhooks**: External system integrations

### Improvements
- [ ] **Performance**: Database query optimization
- [ ] **Accessibility**: Enhanced screen reader support
- [ ] **Internationalization**: Multi-language support
- [ ] **Real-time Updates**: WebSocket integration
- [ ] **Advanced Permissions**: Role-based access control

---

**Built with ❤️ by [Furkan Ulutaş](https://github.com/furkanulutas0)**

*Eventra - Making event scheduling simple and efficient.*