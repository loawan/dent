# Dental Practice Management System

## Overview

A full-stack dental clinic management application built for managing patients, appointments, treatments, billing, and inventory. The system features an interactive odontogram (dental chart) for recording treatments on specific teeth, along with comprehensive practice management workflows designed for busy dental practitioners.

## User Preferences

Preferred communication style: Simple, everyday language.
Doctor Name: Dr. Sai Latt Win Tun
Clinic Name: CNS Dental Corporation
Currency: MMK

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management with custom hooks per domain (patients, appointments, treatments, invoices, inventory)
- **UI Components**: Shadcn/ui component library built on Radix UI primitives with Tailwind CSS styling
- **Design System**: Material Design-inspired healthcare theme with medical blue color palette, Inter font for body text, Plus Jakarta Sans for display headings

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **API Design**: RESTful API with Zod validation for request/response schemas
- **Route Definitions**: Centralized in `shared/routes.ts` with type-safe API contracts shared between client and server
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Build Process**: Custom build script using esbuild for server bundling and Vite for client

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema**: Five core tables - patients, appointments, treatments, invoices, inventory
- **Schema Location**: `shared/schema.ts` with Drizzle-Zod integration for automatic validation schema generation

### Key Design Patterns
- **Shared Types**: TypeScript types and Zod schemas shared between client and server via `shared/` directory
- **Custom Hooks**: Domain-specific React Query hooks encapsulate all API interactions (`use-patients.ts`, `use-appointments.ts`, etc.)
- **Component Composition**: Layout component with persistent sidebar navigation wrapping all pages
- **Path Aliases**: `@/` for client source, `@shared/` for shared code, `@assets/` for attached assets

### Application Structure
```
client/src/
├── components/     # Reusable UI components (Layout, Sidebar, Odontogram, StatusBadge)
├── components/ui/  # Shadcn/ui primitives
├── hooks/          # React Query hooks for each domain
├── pages/          # Route page components
├── lib/            # Utilities (queryClient, cn helper)

server/
├── index.ts        # Express app setup
├── routes.ts       # API route handlers
├── storage.ts      # Database operations layer
├── db.ts           # Database connection

shared/
├── schema.ts       # Drizzle table definitions + Zod schemas
├── routes.ts       # API contract definitions with Zod
```

### Recent Changes
- Added X-ray upload and gallery feature for patients using object storage.
- Implemented Mixed Dentition support in Odontogram component with Tabs for switching between Permanent, Primary, and Mixed views.
- Fixed database relation error by pushing latest schema changes to PostgreSQL.
- Improved medical alert display in PatientDetails with better formatting for allergies.

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Schema management and type-safe queries
- **connect-pg-simple**: PostgreSQL session store (if sessions are added)

### Frontend Libraries
- **@tanstack/react-query**: Server state caching and synchronization
- **Radix UI**: Accessible UI primitives (dialogs, selects, tooltips, etc.)
- **Recharts**: Dashboard analytics charts
- **date-fns**: Date formatting and manipulation
- **wouter**: Lightweight routing
- **clsx/tailwind-merge**: Class name utilities

### Build Tools
- **Vite**: Frontend development server and bundler
- **esbuild**: Server-side bundling for production
- **TypeScript**: Type checking across the stack
- **Tailwind CSS**: Utility-first styling with custom theme configuration

### Replit-Specific
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay
- **@replit/vite-plugin-cartographer**: Replit development integration
- **@replit/vite-plugin-dev-banner**: Development environment indicator