# replit.md

## Overview

FatigueWatch is a real-time driver drowsiness detection and monitoring system built with a modern React frontend and Express.js backend. The application uses webcam-based computer vision to monitor driver fatigue levels, detect drowsiness indicators (yawning, eye closure, head position), and provide immediate alerts to prevent accidents. The system features a comprehensive dashboard for real-time monitoring, historical data analysis, and driver session management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development practices
- **UI Components**: Shadcn/ui component library built on Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with CSS variables for theming and dark mode support
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Real-time Communication**: WebSocket integration for live detection updates and alerts

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules for modern JavaScript features
- **API Design**: RESTful endpoints with WebSocket support for real-time features
- **Session Management**: In-memory storage with PostgreSQL schema definitions ready for production
- **Request Handling**: Express middleware for JSON parsing, CORS, and request logging

### Data Storage Solutions
- **Development**: In-memory storage implementation for rapid development and testing
- **Production Ready**: Drizzle ORM with PostgreSQL schema definitions for scalable data persistence
- **Database Schema**: Comprehensive tables for drivers, detection logs, alert events, and driver sessions
- **Migration Support**: Drizzle Kit for database schema migrations and version control

### Real-time Detection System
- **Computer Vision**: Webcam-based detection for drowsiness indicators
- **Detection Metrics**: Eye state monitoring, blink rate analysis, head position tracking, yawn detection
- **Scoring Algorithm**: Drowsiness score calculation with configurable thresholds
- **Alert Levels**: Three-tier system (safe, warning, critical) with escalating responses

### Audio Alert System
- **Web Audio API**: Browser-based audio generation for immediate feedback
- **Alert Types**: Graduated audio alerts from notifications to emergency sounds
- **User Control**: Configurable alert preferences and volume controls

### WebSocket Real-time Features
- **Live Updates**: Real-time detection data streaming to dashboard
- **Instant Alerts**: Immediate critical alert notifications
- **Connection Management**: Automatic reconnection handling and connection status monitoring
- **Broadcast System**: Multi-client support for monitoring dashboards

## External Dependencies

### Core Technologies
- **Neon Database**: Serverless PostgreSQL for production data storage
- **Drizzle ORM**: Type-safe database operations and schema management
- **Vite**: Build tool and development server with HMR support

### UI and Styling
- **Radix UI**: Accessible component primitives for complex UI elements
- **Tailwind CSS**: Utility-first CSS framework with PostCSS processing
- **Lucide React**: Icon library for consistent iconography

### Real-time and State Management
- **TanStack Query**: Server state management, caching, and synchronization
- **WebSocket**: Native browser WebSocket API for real-time communication
- **React Hook Form**: Form handling with Zod validation schemas

### Development and Build Tools
- **TypeScript**: Static type checking and enhanced developer experience
- **ESBuild**: Fast bundling for production builds
- **Replit Plugins**: Development environment integration and error handling

### Monitoring and Audio
- **Web Audio API**: Cross-browser audio generation and playback
- **Recharts**: Data visualization for fatigue trends and analytics
- **Date-fns**: Date manipulation and formatting utilities