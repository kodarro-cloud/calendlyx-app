# System Architecture

## Application Flow

```
┌─────────────────────────────────────────────────────────┐
│                        App.tsx                           │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  Mode Toggle Button (Switch Public/Admin)      │    │
│  └────────────────────────────────────────────────┘    │
│                         │                               │
│          ┌──────────────┴──────────────┐               │
│          ▼                              ▼               │
│  ┌───────────────┐            ┌────────────────┐       │
│  │ Public View   │            │  Admin View    │       │
│  └───────────────┘            └────────────────┘       │
└─────────────────────────────────────────────────────────┘
```

## Public View Architecture

```
PublicEventsPage.tsx
├── Sidebar (Left Column)
│   ├── "Happening Now" Section
│   │   └── List of current events
│   └── "Upcoming Next" Section
│       └── List of upcoming events
│
└── Main Content (Right Column)
    ├── MonthlyCalendar Component
    │   ├── Month navigation (Prev/Today/Next)
    │   ├── Calendar grid (7x5 or 7x6)
    │   ├── Date cells with event badges
    │   └── Color-coded events
    │
    └── Selected Date Events
        └── Full event cards for selected date
```

## Admin View Architecture

```
AdminEventsPage.tsx
├── Tab Navigation
│   ├── "Add Event" Tab
│   └── "View Events" Tab
│
├── Tab Content: Add Event
│   └── AddEventForm Component
│       ├── Title input
│       ├── Description textarea
│       ├── Location input
│       ├── Start date/time inputs
│       ├── End date/time inputs
│       ├── Public checkbox
│       └── Submit/Clear buttons
│
└── Tab Content: View Events
    └── YearlyView Component
        ├── Year header
        ├── 12 Month cards (3x4 grid)
        │   └── Each card shows:
        │       ├── Month name
        │       ├── Event count
        │       └── List of events
        └── Legend
```

## Data Flow

```
┌──────────────────────────────────────────────────────────┐
│                    Firebase Firestore                     │
│                                                           │
│    Collection: events                                     │
│    ├── event1 {title, description, dates, ...}          │
│    ├── event2 {title, description, dates, ...}          │
│    └── event3 {title, description, dates, ...}          │
└───────────────┬──────────────────────────────────────────┘
                │
                │ Real-time listeners
                │ (subscribeToEvents)
                ▼
┌───────────────────────────────────────────────────────────┐
│              firebaseUtils.ts (Data Layer)                │
│                                                           │
│  Functions:                                               │
│  • addEvent(event)          → Create new event           │
│  • getEvents(publicOnly)    → Fetch events once          │
│  • subscribeToEvents()      → Real-time updates          │
└───────────────┬───────────────────────────────────────────┘
                │
                │ Raw events array
                ▼
┌───────────────────────────────────────────────────────────┐
│            eventUtils.ts (Business Logic)                 │
│                                                           │
│  Functions:                                               │
│  • categorizeEvents()       → Sort by current/upcoming    │
│  • getEventsOnDate()        → Filter by date             │
│  • getEventsInMonth()       → Filter by month            │
│  • formatEventDate()        → Display formatting         │
└───────────────┬───────────────────────────────────────────┘
                │
                │ Processed events
                ▼
┌───────────────────────────────────────────────────────────┐
│              React Components (UI Layer)                  │
│                                                           │
│  • Display categorized events                            │
│  • Handle user interactions                              │
│  • Update UI on data changes                             │
└───────────────────────────────────────────────────────────┘
```

## Event State Categorization

```
                    Now
                     │
     Past            │         Current         │      Upcoming
─────────────────────┼─────────────────────────┼──────────────────→
                     │                         │      Time
                     │                         │
      endDate < now  │  startDate ≤ now ≤ endDate  │  startDate > now
                     │                         │
```

## Component Relationships

```
App
├── PublicEventsPage
│   ├── useState(events)
│   ├── useEffect(subscribeToEvents)
│   └── MonthlyCalendar
│       ├── Props: events[]
│       ├── State: currentMonth
│       └── Renders: Calendar grid
│
└── AdminEventsPage
    ├── useState(events)
    ├── useEffect(subscribeToEvents)
    ├── AddEventForm
    │   ├── Props: none
    │   ├── State: formData
    │   └── Calls: addEvent()
    │
    └── YearlyView
        ├── Props: events[], year
        └── Renders: 12 month cards
```

## Color System

```
Event Status Colors:
┌─────────────────────────────────────┐
│ Current (Happening Now)             │
│ • Background: bg-green-50/100       │
│ • Border: border-green-300/500      │
│ • Text: text-green-800              │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Upcoming (Future Events)            │
│ • Background: bg-blue-50/100        │
│ • Border: border-blue-300/500       │
│ • Text: text-blue-800               │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Past (Ended Events)                 │
│ • Background: bg-gray-50/100        │
│ • Border: border-gray-300           │
│ • Text: text-gray-800               │
└─────────────────────────────────────┘

Page Themes:
• Public Page: Blue/Indigo gradient
• Admin Page: Purple/Indigo gradient
```

## Security Architecture

```
┌────────────────────────────────────────┐
│         Client Application              │
│                                        │
│  Public Page (Read Only)               │
│  • Can view isPublic: true events     │
│  • No write operations                │
│                                        │
│  Admin Page (Read/Write)               │
│  • Can view all events                │
│  • Can create events                  │
│  • Future: Requires authentication    │
└────────────┬───────────────────────────┘
             │
             │ Firebase SDK
             ▼
┌────────────────────────────────────────┐
│    Firestore Security Rules            │
│                                        │
│  match /events/{event} {               │
│    allow read:                         │
│      if resource.data.isPublic == true │
│                                        │
│    allow write:                        │
│      if request.auth != null           │
│  }                                     │
└────────────────────────────────────────┘
```

## Deployment Architecture (Future)

```
┌──────────────────────────────────────────────┐
│              Build Process                    │
│                                              │
│  npm run build                               │
│  └─→ Vite builds to /dist                   │
│      ├── index.html                          │
│      ├── assets/                             │
│      │   ├── main.[hash].js                 │
│      │   └── main.[hash].css                │
│      └── optimized & minified               │
└───────────────┬──────────────────────────────┘
                │
                ▼
┌──────────────────────────────────────────────┐
│           Hosting Options                     │
│                                              │
│  Option 1: Firebase Hosting                  │
│  • firebase deploy                           │
│  • CDN delivery                              │
│  • SSL included                              │
│                                              │
│  Option 2: Vercel                            │
│  • Automatic deployments                     │
│  • Edge network                              │
│                                              │
│  Option 3: Netlify                           │
│  • Drag-and-drop deploy                      │
│  • Form handling                             │
└──────────────────────────────────────────────┘
```

## Technology Stack

```
Frontend
├── React 19              → UI framework
├── TypeScript            → Type safety
├── Vite                  → Build tool
└── Tailwind CSS          → Styling

Backend
├── Firebase Firestore    → Database
├── Firebase Auth         → Authentication (future)
└── Firebase Hosting      → Deployment (optional)

Libraries
├── date-fns             → Date manipulation
├── react-hot-toast      → Notifications
└── firebase SDK         → Backend integration
```

## Performance Optimizations

```
1. Real-time Updates
   • Use subscribeToEvents for live data
   • Automatic UI updates on data changes

2. Efficient Rendering
   • useMemo for expensive calculations
   • Date processing cached per render

3. Code Splitting (Future)
   • Lazy load admin components
   • Separate bundles for public/admin

4. Firestore Queries
   • Index on isPublic and startDate
   • Filter at database level
   • Limit initial query results
```
