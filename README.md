# Community Hero

A hyperlocal civic issue reporting and management platform that connects citizens with local authorities to report, track, and resolve public infrastructure problems.

## Features

- **Secure Authentication**: Email/password and Google OAuth via Supabase Auth
- **Issue Reporting**: Upload images, add descriptions, select categories, and detect location via GPS or interactive map
- **AI Classification**: Automatic issue categorization and severity assessment using TensorFlow.js
- **Issue Tracking**: Clear status workflow (Reported → Verified → Assigned → In Progress → Resolved)
- **Interactive Map**: Google Maps integration with clustering and filtering
- **Duplicate Detection**: Shows existing nearby reports before submission
- **Community Engagement**: Upvote, comment, follow issues, and add supporting information
- **Real-time Notifications**: Instant updates on issue status changes
- **Authority Dashboard**: Tools for municipal officials to manage and resolve issues
- **Analytics Dashboard**: Trends, category distribution, resolution rates, and geographic hotspots

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Authentication**: Supabase Auth (Email/Password + Google OAuth)
- **Database**: Supabase PostgreSQL with PostGIS
- **Maps**: Google Maps Platform
- **AI/ML**: TensorFlow.js + MobileNet for image classification
- **Charts**: Chart.js + react-chartjs-2
- **Forms**: React Hook Form + Zod validation
- **UI Components**: Radix UI primitives
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 20+
- npm or pnpm
- Supabase account
- Google Cloud Console project (for Maps & OAuth)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/community-hero.git
cd community-hero
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Fill in your credentials:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google Maps Platform
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Community Hero"
```

4. Set up the database:
   - Create a new Supabase project
   - Run the migration in `supabase/migrations/001_initial_schema.sql`
   - Enable Google OAuth in Supabase Auth settings

5. Configure Google Maps:
   - Enable Maps JavaScript API and Places API in Google Cloud Console
   - Add authorized domains
   - Configure OAuth consent screen

6. Run development server:
```bash
npm run dev
```

Visit `http://localhost:3000`

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth pages (login, register)
│   ├── (dashboard)/       # Citizen dashboard pages
│   ├── (authority)/       # Authority dashboard pages
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
├── components/
│   ├── ui/                # Reusable UI components (Radix-based)
│   ├── layout/            # Layout components (Header, Footer)
│   ├── map/               # Map components
│   ├── forms/             # Form components
│   ├── issue/             # Issue-related components
│   ├── charts/            # Chart components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and configurations
├── types/                 # TypeScript type definitions
```

## Database Schema

Key tables:
- `profiles` - Extended user profiles with roles
- `issues` - Civic issue reports with geospatial data
- `comments` - Community comments on issues
- `issue_updates` - Status change history
- `votes` - Upvote/downvote tracking
- `follows` - Issue following subscriptions
- `notifications` - User notifications

## API Routes

- `GET/POST /api/issues` - List/create issues
- `GET/PATCH/DELETE /api/issues/[id]` - Issue details and updates
- `GET /api/issues/nearby` - Find nearby issues
- `POST /api/ai/classify` - AI issue classification
- `GET/PATCH /api/notifications` - Notification management
- `PATCH /api/profile` - Profile updates

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Docker

```bash
docker build -t community-hero .
docker run -p 3000:3000 community-hero
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

- Documentation: [docs.communityhero.app](https://docs.communityhero.app)
- Issues: [GitHub Issues](https://github.com/your-org/community-hero/issues)
- Email: support@communityhero.app