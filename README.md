# Leave Management System - Next.js Implementation

This is a Next.js implementation of the Leave Management System, recreating the functionality from the original Angular application. The application allows employees to manage their leave requests and managers to approve them.

## Features

- **Authentication**: Simple employee ID-based login system
- **Employee Features**:
  - View personal leave requests and their status
  - Request new leave (regular and special leave types)
  - View leave balance and usage
  - Cancel pending leave requests
- **Manager Features**:
  - Approve/reject subordinate leave requests
  - View all subordinate leave requests
  - All employee features

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Data Fetching**: TanStack Query (React Query) + Axios
- **Database**: SQLite with Prisma ORM
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Set up the database**:
   ```bash
   # Generate Prisma client
   pnpm db:generate
   
   # Push the schema to create the database
   pnpm db:push
   
   # Seed the database with sample data
   pnpm db:seed
   ```

3. **Start the development server**:
   ```bash
   pnpm dev
   ```

4. **Open the application**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Demo Users

The application comes with pre-seeded demo users for testing:

### Employees
- **K012345** - Mohammad Farhadi (Employee, reports to K000001)
- **K012346** - Bertold Oravecz (Employee, reports to K000001)
- **K012347** - Carol Davis (Employee, reports to K000002)

### Managers
- **K000001** - Velthoven Jeroen-van (Manager)
- **K000002** - Eszter Nasz (Manager)

## Application Structure

```
src/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   └── page.tsx          # Home/login page
├── components/            # React components
│   ├── Login.tsx
│   ├── LeaveForm.tsx
│   ├── LeavesList.tsx
│   └── LeaveBalance.tsx
├── contexts/              # React contexts
│   └── AuthContext.tsx
├── hooks/                 # Custom React hooks
│   ├── useAuth.ts
│   ├── useEmployees.ts
│   ├── useLeaves.ts
│   └── useLeaveBalance.ts
├── lib/                   # Utilities and configs
│   ├── prisma.ts
│   ├── leave-business-rules.ts
│   └── react-query/
├── services/              # API services
│   ├── api.ts
│   ├── authService.ts
│   ├── employeeService.ts
│   ├── leaveService.ts
│   └── leaveBalanceService.ts
└── types/                 # TypeScript type definitions
```

## Business Rules Implemented

- **Leave Balance**: 25 days (200 hours) per year for full-time employees
- **Part-time**: Pro rata calculation based on contract hours
- **Business Days**: Leave calculations consider weekends
- **Overlap Prevention**: Cannot request overlapping leave periods
- **Future Dates**: Cannot request leave in the past
- **Special Leave Rules**:
  - Must be requested 2 weeks in advance
  - Different limits per type (Moving: 1 day, Wedding: 1 day, Child Birth: 5 days, Parental Care: 10x contract hours)
- **Approval Workflow**: Only direct managers can approve leave requests
- **Cancellation Rules**: Only pending/requested leaves can be cancelled by employees

## API Endpoints

### Authentication
- `POST /api/auth` - Login with employee ID

### Employees
- `GET /api/employees` - Get all employees
- `GET /api/employees/{id}/leaves` - Get employee's leaves
- `GET /api/employees/{id}/balance` - Get employee's leave balance

### Leaves
- `POST /api/leaves` - Create new leave request
- `DELETE /api/leaves/{id}` - Cancel leave request
- `PATCH /api/leaves/{id}/status` - Update leave status (approve/reject)

### Managers
- `GET /api/managers/{id}/leaves` - Get subordinate leaves

## Development Commands

```bash
# Development
pnpm dev                    # Start development server
pnpm build                  # Build for production
pnpm start                  # Start production server

# Database
pnpm db:generate           # Generate Prisma client
pnpm db:push              # Push schema changes
pnpm db:migrate           # Run migrations
pnpm db:studio            # Open Prisma Studio
pnpm db:seed              # Seed database

# Code Quality
pnpm lint                 # Run ESLint
```

## Key Differences from Angular Version

1. **State Management**: Uses React Query instead of Angular services with RxJS
2. **Routing**: Next.js App Router instead of Angular Router
3. **Forms**: React hooks and state instead of Angular Reactive Forms
4. **HTTP Client**: Axios instead of Angular HTTP Client
5. **Styling**: Same Tailwind CSS approach
6. **Authentication**: Context API instead of Angular services

## Future Enhancements

- [ ] Session management and JWT tokens
- [ ] Email notifications for leave requests
- [ ] Calendar integration
- [ ] Public holidays management
- [ ] Bulk leave operations
- [ ] Advanced reporting and analytics
- [ ] Mobile responsiveness improvements
- [ ] Internationalization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for demonstration purposes as part of a technical assessment.
