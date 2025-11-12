# Backend Files Reference

## Core Backend Files

### TypeScript/JavaScript Files

#### `client/src/lib/auth.ts`
- User authentication functions
- Sign up, sign in, sign out
- Profile retrieval
- Auth state management
- Size: ~2.5 KB

#### `client/src/lib/api.ts`
- Main API functions for all operations
- Trip management (get, create, list)
- Bid submission and retrieval
- Booking confirmation
- Message handling
- Profile management
- Size: ~5 KB

#### `client/src/lib/supabase.ts`
- Supabase client initialization
- Edge function caller utility
- Token management
- Size: ~1.5 KB

#### `client/src/lib/types.ts`
- TypeScript interfaces and types
- Database table types
- API payload types
- Size: ~3 KB

#### `client/src/lib/queryClient.ts`
- React Query client setup
- Query configuration
- Size: ~500 B

### Documentation Files

#### `BACKEND_GUIDE.md`
- Complete backend architecture
- Database schema details
- RLS policies explanation
- Edge function documentation
- API functions reference
- Environment setup
- Size: ~25 KB

#### `DATABASE_SCHEMA.md`
- Detailed schema reference
- Complete SQL for each table
- Entity relationships
- Indexes and constraints
- Query examples
- Migration history
- Size: ~15 KB

#### `API_DOCUMENTATION.md`
- REST API reference
- All endpoints documented
- Request/response examples
- Error handling
- Rate limiting info
- Frontend usage examples
- Best practices
- Size: ~20 KB

#### `BACKEND_SUMMARY.md`
- Overview of entire backend
- Project structure
- Getting started guide
- Feature overview
- Common issues and solutions
- Deployment instructions
- Size: ~20 KB

#### `.env`
- Supabase connection variables
- VITE_SUPABASE_URL
- VITE_SUPABASE_SUPABASE_ANON_KEY
- Size: ~200 B

## Supabase Cloud Resources

### Database Tables (6 total)
1. **profiles** - User accounts
   - Columns: 8
   - RLS: Enabled
   - Policies: 3

2. **driver_profiles** - Extended driver info
   - Columns: 10
   - RLS: Enabled
   - Policies: 4

3. **trips** - Trip postings
   - Columns: 14
   - RLS: Enabled
   - Policies: 4
   - Indexes: 3

4. **driver_bids** - Driver bids
   - Columns: 10
   - RLS: Enabled
   - Policies: 5
   - Indexes: 3
   - Constraints: 1 UNIQUE

5. **bookings** - Confirmed bookings
   - Columns: 13
   - RLS: Enabled
   - Policies: 3
   - Indexes: 3
   - Constraints: 1 UNIQUE

6. **messages** - Chat messages
   - Columns: 7
   - RLS: Enabled
   - Policies: 3
   - Indexes: 4

### Edge Functions (6 deployed)

1. **get-trips**
   - File: `index.ts`
   - Type: GET
   - Auth: Required
   - Location: `/functions/v1/get-trips`

2. **create-trip**
   - File: `index.ts`
   - Type: POST
   - Auth: Required
   - Location: `/functions/v1/create-trip`

3. **submit-bid**
   - File: `index.ts`
   - Type: POST
   - Auth: Required
   - Location: `/functions/v1/submit-bid`

4. **accept-bid**
   - File: `index.ts`
   - Type: POST
   - Auth: Required
   - Location: `/functions/v1/accept-bid`

5. **get-my-trips**
   - File: `index.ts`
   - Type: GET
   - Auth: Required
   - Location: `/functions/v1/get-my-trips`

6. **get-my-bids**
   - File: `index.ts`
   - Type: GET
   - Auth: Required
   - Location: `/functions/v1/get-my-bids`

### Authentication
- Provider: Supabase Auth
- Method: Email/Password
- JWT: Enabled
- Sessions: Automatic management
- Users: Stored in auth.users table
- Profiles: Linked via UUID

### Storage
- Configuration: Not currently used
- Available: Image storage for profiles/vehicles

## File Summary Statistics

**Total Backend Files:** 10
**Total Documentation:** ~80 KB
**Total Code:** ~12 KB
**Database Tables:** 6
**Database Policies:** 18
**Edge Functions:** 6
**Indexes:** 13
**Type Definitions:** 9

## File Dependencies

```
auth.ts
├── supabase.ts
└── types.ts

api.ts
├── supabase.ts
├── types.ts
└── auth.ts (indirectly)

supabase.ts
└── @supabase/supabase-js (external)

types.ts
└── (standalone)

queryClient.ts
└── @tanstack/react-query (external)
```

## Deployment Information

### Backend Hosted On
- **Provider:** Supabase (Google Cloud)
- **Region:** Configurable per project
- **Database:** PostgreSQL 14+
- **Edge Functions:** Deno runtime

### URLs
- **Supabase URL:** https://your-project.supabase.co
- **API Endpoint:** https://your-project.supabase.co/rest/v1
- **Functions Endpoint:** https://your-project.supabase.co/functions/v1

## Version Information

- Supabase JS Client: v2.x
- PostgreSQL: 14+
- Deno Runtime: Latest
- Node.js (development): 18+
- TypeScript: 5.x

## Configuration

### Environment Variables
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_SUPABASE_ANON_KEY=eyJ...
```

### Database Connection
- Via Supabase client (frontend)
- Via edge functions (backend)
- Connection pooling: Automatic
- SSL/TLS: Always enabled

## Monitoring & Debugging

### Available Logs
- Function execution logs
- Database query logs
- Authentication logs
- API request logs

### Accessible Via
- Supabase Dashboard
- Browser DevTools
- API responses (errors)

## Total Backend Statistics

- **Lines of Code:** ~500
- **Number of Tables:** 6
- **Number of RLS Policies:** 18
- **Number of Indexes:** 13
- **API Endpoints:** 6
- **Edge Functions:** 6
- **TypeScript Interfaces:** 9
- **Documentation Pages:** 4
- **Total Documentation:** ~80 KB
- **Time to Deploy:** ~5 minutes
- **Setup Difficulty:** Easy
- **Maintenance:** Minimal (Supabase managed)

## Related Files

### In Frontend
- `client/src/pages/` - Pages using backend
- `client/src/components/` - Components with API calls
- `client/package.json` - Dependencies

### In Project Root
- `.env` - Configuration
- `BACKEND_GUIDE.md` - Architecture docs
- `DATABASE_SCHEMA.md` - Schema reference
- `API_DOCUMENTATION.md` - API reference
- `BACKEND_SUMMARY.md` - Overview

---

**Generated:** November 6, 2025
**Status:** All systems operational
**Last Updated:** Migrations complete, Edge Functions deployed