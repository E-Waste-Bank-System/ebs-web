# E-Waste Bank System - Frontend

A modern web application for AI-powered e-waste management and recycling built with Next.js 15 and TypeScript.

## 🚀 Features

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS v4** with Shadcn UI components
- **TanStack Query** for server state management
- **JWT Authentication** with role-based access control
- **Recharts** for data visualization
- **Responsive Design** for all devices
- **Dark/Light Theme** support

## 🛠️ Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn UI
- **State Management**: TanStack Query (React Query)
- **Authentication**: JWT with custom context
- **Charts**: Recharts
- **Icons**: Lucide React
- **Theme**: next-themes

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Running NestJS backend server

## 🚀 Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   Create `.env.local` with:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Visit [http://localhost:3000](http://localhost:3000)

## 🔐 Demo Accounts

- **Admin**: admin@ebs.com / admin123
- **User**: user@ebs.com / user123

## 📁 Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin dashboard pages
│   ├── login/             # Authentication pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Home page
│   └── providers.tsx      # App providers
├── components/
│   ├── layout/           # Layout components
│   └── ui/               # Shadcn UI components
└── lib/
    ├── api-client.ts     # API client configuration
    ├── auth-context.tsx  # Authentication context
    ├── queries.ts        # TanStack Query hooks
    └── utils.ts          # Utility functions
```

## 🎯 Key Features

### Authentication
- JWT-based authentication
- Role-based access control (USER, ADMIN, SUPERADMIN)
- Automatic token management
- Protected routes

### Dashboard
- Real-time KPI metrics
- Interactive charts and graphs
- System health monitoring
- Quick action buttons

### Admin Features
- User management
- Scan management
- Object validation
- Article management
- Analytics dashboard
- AI retraining data

### UI/UX
- Modern, responsive design
- Dark/light theme toggle
- Intuitive navigation
- Loading states and error handling
- Mobile-friendly interface

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Shadcn UI
npx shadcn@latest add <component>  # Add UI components
```

### API Integration

The frontend connects to a NestJS backend with the following endpoints:

- **Authentication**: `/auth/login`, `/auth/profile`
- **Dashboard**: `/admin/dashboard`
- **Scans**: `/admin/scans`, `/scans`
- **Objects**: `/objects`, `/admin/objects`
- **Articles**: `/admin/articles`
- **Users**: `/profiles`
- **Retraining**: `/retraining`

### Data Flow

1. **Authentication** → JWT token stored in localStorage
2. **TanStack Query** → Server state management with caching
3. **API Client** → Centralized HTTP client with interceptors
4. **Context Providers** → Global state management

## 🎨 UI Components

Built with Shadcn UI components:
- Cards, Buttons, Forms
- Data Tables, Dialogs
- Navigation, Menus
- Charts, Progress bars
- Alerts, Badges, Skeletons

## 📱 Responsive Design

- **Mobile**: Collapsible sidebar, touch-friendly
- **Tablet**: Optimized layouts
- **Desktop**: Full feature set

## 🚀 Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Configure environment variables**
   Set `NEXT_PUBLIC_API_URL` to your backend URL

3. **Deploy to your platform**
   - Vercel (recommended)
   - Netlify
   - AWS
   - Docker

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Related Projects

- **Backend**: NestJS API server
- **AI Model**: Python-based object detection
- **Mobile App**: React Native application

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

---

Built with ❤️ using Next.js 15 and modern web technologies.
