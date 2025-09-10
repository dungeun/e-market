# 🏛️ Project Decisions Record
*This file is NEVER archived - Only critical decisions*
*Created: 2025-09-04 | Commerce-NextJS Project*

## Architecture Decisions

### 2025-09-04 | AI Context Management System
- **Context**: Need to maintain context across AI sessions
- **Decision**: Implement rolling context system with 500-line limit
- **Reason**: Prevents file bloat, maintains history, minimal management overhead
- **Consequences**: Need automation scripts, regular archiving
- **Session**: #001

### 2025-09-04 | Database: Local PostgreSQL
- **Context**: Initial Supabase setup, but need local development
- **Decision**: Use local PostgreSQL for development
- **Reason**: Better control, no external dependencies, faster development
- **Consequences**: Need to manage local DB, migrations
- **Session**: #001
- **Connection**: postgresql://commerce:password@localhost:5432/commerce_nextjs

### 2025-09-03 | UI Framework: shadcn/ui
- **Context**: Need consistent, accessible UI components
- **Decision**: Use shadcn/ui component library
- **Reason**: Customizable, accessible, TypeScript support, Tailwind integration
- **Consequences**: Need to properly configure Sidebar components
- **Session**: #000

### 2025-09-03 | Multi-language Support
- **Context**: Target audience is foreign workers in Korea
- **Decision**: Support Korean, English, Japanese
- **Reason**: Cover major foreign worker demographics
- **Consequences**: Need language pack management system, UI translations
- **Session**: #000

## Critical Learnings

### ⚠️ 2025-09-04 | PostgreSQL Permissions
**Never Forget**: New PostgreSQL users need explicit permissions
```sql
-- Always run these after creating user/database
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO commerce;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO commerce;
GRANT ALL PRIVILEGES ON SCHEMA public TO commerce;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO commerce;
```

### ⚠️ 2025-09-04 | Sidebar Layout Structure  
**Never Forget**: shadcn/ui Sidebar requires specific structure
```jsx
// ✅ CORRECT Structure
<SidebarProvider>
  <Sidebar>...</Sidebar>
  <SidebarInset>
    <header>...</header>
    <div>{children}</div>  // Not <main> - SidebarInset already renders as main
  </SidebarInset>
</SidebarProvider>
```

### ⚠️ 2025-09-04 | Hydration Errors with next-themes
**Never Forget**: Add suppressHydrationWarning to html and body tags
```jsx
<html lang="ko" suppressHydrationWarning>
  <body suppressHydrationWarning>
```

### ⚠️ 2025-09-04 | Database Schema Mismatches
**Never Forget**: Check actual table columns before querying
- categories table: uses 'icon' not 'image_url'
- categories table: uses 'level' not 'menu_order'
- categories table: uses 'deleted_at' for soft deletes, not 'is_active'

## Project Constants

### Database Tables
- users
- products  
- categories
- orders
- language_pack_keys
- language_pack_values
- ui_sections
- popup_alerts

### Environment Variables (Required)
- DATABASE_URL
- POSTGRES_URL
- POSTGRES_PRISMA_URL
- POSTGRES_URL_NON_POOLING
- REDIS_URL
- JWT_SECRET
- NEXTAUTH_SECRET

### Protected Files (Do NOT Modify)
- /app/layout.tsx (root layout with providers)
- /providers/providers.tsx (context providers setup)
- /lib/db.ts (database connection)

## Development Standards

### Git Commit Format
- Use conventional commits: feat:, fix:, docs:, style:, refactor:, test:, chore:

### File Organization
- Components: /components/ui/ (shadcn components)
- API Routes: /app/api/
- Admin Pages: /app/admin/
- Lib Functions: /lib/
- Types: /types/

### Testing Requirements
- Unit tests for critical functions
- E2E tests for payment flows
- Integration tests for API endpoints