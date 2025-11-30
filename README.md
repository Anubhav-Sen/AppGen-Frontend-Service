# AppGen Frontend

A visual schema builder and code generator for FastAPI applications. Design your database models with an intuitive drag-and-drop interface and generate FastAPI-compatible specifications automatically.

## Features

- **Visual Schema Builder** - Drag-and-drop interface powered by React Flow for designing database models
- **Model & Column Editor** - Create models with various column types (Integer, String, Boolean, Float, Text, DateTime, UUID, Enum, etc.)
- **Relationship Management** - Define OneToOne, OneToMany, and ManyToMany relationships with cascade options
- **Bidirectional Relationships** - Automatic back_populates configuration for bidirectional relationships
- **Enum Support** - Visual enum nodes with full CRUD operations
- **Association Tables** - Built-in support for many-to-many junction tables
- **Project Configuration** - Configure database provider, security settings, JWT tokens, and Git integration
- **Code Generation** - Export schemas as FastAPI-compatible JSON specifications
- **Authentication** - JWT-based auth with remember me functionality and automatic token refresh
- **Project Management** - Save, load, and manage multiple schema projects

## Architecture

<img width="1762" height="601" alt="appgen-frontend drawio" src="https://github.com/user-attachments/assets/3d062db7-6018-40bb-b83e-42109ea17d52" />

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | React 19 |
| **Language** | TypeScript 5.9 |
| **Build Tool** | Vite 7 |
| **Routing** | React Router DOM 7 |
| **State Management** | Zustand 5 |
| **Data Fetching** | TanStack React Query 5 |
| **Forms** | React Hook Form 7 |
| **Validation** | Zod 4 |
| **HTTP Client** | Axios |
| **Flow Diagrams** | React Flow / @xyflow/react |
| **Styling** | Tailwind CSS 4 |
| **Testing** | Jest + React Testing Library |
| **Linting** | ESLint 9 |
| **Formatting** | Prettier |

## Prerequisites

- Node.js 18+
- npm or yarn

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd appgen-frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=https://appgen-backend-temp-production.up.railway.app/api
```

### 4. Start the development server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production (TypeScript compile + Vite build) |
| `npm run preview` | Preview production build locally |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run lint` | Run ESLint on TypeScript files |
| `npm run lint:fix` | Fix ESLint issues automatically |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |
| `npm run test` | Run Jest tests |
| `npm run test:watch` | Run tests in watch mode |

## Project Structure

```
src/
├── api/                 # API client and endpoints
│   ├── client.ts        # Axios instance with auth interceptors
│   ├── auth.ts          # Authentication endpoints
│   ├── schemas.ts       # Schema CRUD operations
│   └── user.ts          # User endpoints
├── components/          # Reusable React components
│   ├── schema/          # Schema builder components
│   │   ├── nodes/       # React Flow node types (ModelNode, EnumNode)
│   │   └── editors/     # Entity editors (Model, Enum, Column, Relationship)
│   ├── config/          # Configuration forms
│   └── ui/              # UI components (FormInput, Alert)
├── hooks/               # Custom React hooks
├── lib/                 # Utilities and helpers
│   ├── utils/           # Flow converter, error handling
│   ├── schemas/         # Zod validation schemas
│   └── serializers/     # Spec builder for FastAPI export
├── pages/               # Page components
│   └── auth/            # Login and Register pages
├── stores/              # Zustand state stores
├── types/               # TypeScript type definitions
└── styles/              # CSS files
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `https://appgen-backend-temp-production.up.railway.app/api` |

## Building for Production

```bash
npm run build
```

The production build will be output to the `dist/` directory, ready for deployment to any static hosting service.
