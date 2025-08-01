# Medicate - Healthcare Management Platform

## Overview

Medicate is a comprehensive healthcare management platform that connects patients and doctors through a modern web application. The system enables appointment scheduling, prescription management, secure messaging, and telemedicine capabilities. Built with a React frontend and Express backend, it features real-time communication, role-based access control, and a complete healthcare workflow management system.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management with caching and synchronization
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent design
- **Styling**: Tailwind CSS with custom healthcare-themed color variables and dark mode support
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript for API development
- **API Design**: RESTful endpoints organized by feature (auth, users, appointments, prescriptions, messages)
- **Data Validation**: Zod schemas for runtime type checking and API validation
- **Session Management**: Express sessions with PostgreSQL storage via connect-pg-simple
- **Development**: Hot module replacement with Vite integration for full-stack development

### Authentication & Authorization
- **Authentication**: Email/password based login with session management
- **Authorization**: Role-based access control (patient/doctor roles)
- **Session Storage**: Persistent sessions stored in PostgreSQL database
- **Client State**: Authentication state managed via React Context with localStorage persistence

### Data Layer
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema**: Comprehensive healthcare data model including users, appointments, prescriptions, messages, and notifications
- **Database Provider**: Neon serverless PostgreSQL for cloud deployment
- **Migrations**: Drizzle Kit for database schema management and migrations

### Real-time Features
- **Messaging**: Secure patient-doctor communication system
- **Notifications**: Real-time updates for appointments and prescriptions
- **Status Tracking**: Live appointment and prescription status management

### Development Experience
- **Type Safety**: End-to-end TypeScript with shared schemas between client and server
- **Development Tools**: Replit integration with cartographer for enhanced development experience
- **Code Quality**: Consistent code organization with path aliases and module resolution
- **Error Handling**: Runtime error overlay and comprehensive error boundaries

## External Dependencies

### Database & Storage
- **Neon Database**: Serverless PostgreSQL database hosting
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL dialect
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### UI & Styling
- **Radix UI**: Headless UI components for accessibility and customization
- **Tailwind CSS**: Utility-first CSS framework with custom healthcare theme
- **Lucide React**: Icon library for consistent iconography
- **shadcn/ui**: Pre-built component library based on Radix UI

### State & Data Management
- **TanStack Query**: Server state management with caching and background updates
- **React Hook Form**: Form management with validation
- **Zod**: Schema validation for API endpoints and form data

### Development & Build Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Static type checking and enhanced developer experience
- **Replit**: Cloud development environment with specialized tooling

### Communication & Real-time
- **WebSocket Support**: Built-in support for real-time messaging features
- **Email Integration**: Planned integration for appointment reminders and notifications