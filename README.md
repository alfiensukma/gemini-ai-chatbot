# Gemini AI Chatbot

A modern chatbot application built with Nuxt 3, featuring real-time AI conversations powered by Google Gemini, complete with message editing, deletion, and conversation branching capabilities.

## Overview

This application provides an intelligent chat interface where users can:
- Have real-time conversations with AI using Google Gemini models
- Upload and analyze images
- Edit previous messages and regenerate AI responses
- Delete messages with confirmation
- Manage multiple chat sessions
- Track conversation history

## Tech Stack

**Frontend**
- Nuxt 3 - Vue 3 framework with server-side rendering
- Vue 3 Composition API - Reactive component logic
- TypeScript - Type-safe development
- Tailwind CSS - Utility-first styling
- Shadcn-vue - UI component library
- Markdown rendering with syntax highlighting

**Backend**
- Nuxt Server Routes (Nitro) - API endpoints
- Prisma ORM - Database management
- PostgreSQL - Primary database (Neon)
- Google Generative AI SDK - AI model integration
- Vercel AI SDK - Streaming responses

**Authentication**
- Logto - Modern authentication solution

## Prerequisites

Before you begin, ensure you have installed:
- Node.js 18.x or higher
- pnpm 8.x or higher
- Neon cloud database (Pgsql)

## Environment Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd gemini-ai-chatbot
```

2. Install dependencies:
```bash
pnpm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:

```env
# Database (Required)
DATABASE_URL="postgresql://user:password@host:5432/database"

# Logto Authentication (Required)
NUXT_LOGTO_ENDPOINT="https://your-logto-endpoint.logto.app"
NUXT_LOGTO_APP_ID="your-app-id"
NUXT_LOGTO_APP_SECRET="your-app-secret"
NUXT_LOGTO_COOKIE_ENCRYPTION_KEY="your-32-character-encryption-key"

# Google AI (Required)
GOOGLE_API_KEY="your-google-ai-api-key"

# Application (Required)
NUXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Database Setup

1. Generate Prisma client:
```bash
pnpm prisma generate
```

2. Run database migrations:
```bash
pnpm prisma migrate dev
```

3. Optional - Seed database (if seed script exists):
```bash
pnpm prisma db seed
```

## Running the Application

### Development Mode

Start the development server:
```bash
pnpm dev
```

Application will be available at `http://localhost:3000`

### Production Build

Build for production:
```bash
pnpm build
```

Preview production build:
```bash
pnpm preview
```

## Getting API Keys

### Google AI API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create new API key
3. Copy to `GOOGLE_API_KEY` in `.env`

### Logto Authentication
1. Sign up at [Logto Cloud](https://cloud.logto.io)
2. Create new application
3. Configure redirect URIs: `http://localhost:3000/callback`
4. Copy credentials to `.env`

### Database (Neon)
1. Sign up at [Neon](https://neon.tech)
2. Create new project
3. Copy connection string to `DATABASE_URL` in `.env`

## Project Structure

```
├── components/          # Vue components
│   ├── Layout/         # Layout components
│   └── ui/             # Shadcn UI components
├── composables/        # Vue composables
├── middleware/         # Route middleware
├── pages/              # Application pages
├── prisma/             # Database schema and migrations
├── server/             # Server-side code
│   └── api/            # API endpoints
└── public/             # Static assets
```

## Key Features

**Chat Management**
- Create and manage multiple chat sessions
- Auto-generated session titles
- Session deletion with confirmation
- Real-time message updates

**Message Operations**
- Edit messages with inline editing
- Delete messages with confirmation dialog
- Automatic AI response regeneration after edits
- Edit history tracking (isEdited, editedAt, originalContent)

**Message Branching**
- Create conversation branches from any message
- Maintain parent-child relationships (parentMessageId)
- Preserve original conversation history
- Future: Branch navigation and visualization

**AI Integration**
- Multiple model support (Gemini 2.0 Flash, 2.5 Pro, 2.5 Flash)
- Real-time streaming responses
- Image upload and analysis
- Context-aware conversations

## Screenshot

### Chat Interface
<img width="1876" height="1014" alt="Screenshot 2025-10-04 065429" src="https://github.com/user-attachments/assets/d75938ec-e4e3-4fac-9c34-eb0e3ba03129" />

## Database Schema
<img width="1620" height="821" alt="Screenshot 2025-10-04 072706" src="https://github.com/user-attachments/assets/8f4bd314-f8cd-46c9-9774-e373ad21b0b2" />

The application uses three main models:

**User**
- Stores user authentication data
- Links to chat sessions

**ChatSession**
- Represents individual chat conversations
- Contains messages and metadata
- Tracks creation and update timestamps

**Message**
- Individual chat messages (user or assistant)
- Supports message branching (parentMessageId)
- Tracks edit history (isEdited, editedAt, originalContent)
- Cascade deletion with sessions

## API Endpoints

**Chat**
- `POST /api/chat` - Create new session
- `GET /api/chat/:sessionId` - Get session with messages
- `DELETE /api/chat/:sessionId` - Delete session
- `GET /api/chat/sessions` - List all user sessions
- `POST /api/chat/stream` - Stream AI responses
- `POST /api/chat/generate-title` - Generate session title

**Messages**
- `PATCH /api/message/:id` - Edit message (supports branching)
- `DELETE /api/message/:id` - Delete message

**User**
- `GET /api/user/me` - Get current user info

## Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm generate     # Generate static site
pnpm prisma:generate  # Generate Prisma client
pnpm prisma:migrate   # Run database migrations
pnpm prisma:studio    # Open Prisma Studio
```

## Troubleshooting

**Database Connection Issues**
- Verify `DATABASE_URL` is correct
- Ensure database is running
- Check firewall/network settings

**Authentication Errors**
- Verify Logto credentials in `.env`
- Check redirect URIs in Logto dashboard
- Clear browser cookies and try again

**AI Response Errors**
- Verify `GOOGLE_API_KEY` is valid
- Check API quota limits
- Review error messages in browser console

**Build Errors**
- Delete `node_modules` and `.nuxt` folders
- Run `pnpm install` again
- Clear pnpm cache: `pnpm store prune`

## Development Notes

**Auto-refresh Behavior**
- Sidebar refreshes every 2 seconds when on chat page
- Immediate refresh after sending messages
- Session reloads after message edits/deletes

**Message IDs**
- Messages need database IDs for edit/delete buttons
- Session reloads after streaming to fetch IDs
- 1-second delay ensures database writes complete

**Streaming Implementation**
- Uses Vercel AI SDK for streaming
- Real-time message updates during AI response
- Proper error handling and recovery

## License

MIT License - See LICENSE file for details

## Contributing

Contributions are welcome. Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

For issues or questions:
- Open an issue on GitHub
- Check existing issues for solutions
