# Event Management System

A modern, full-featured event management system built with React, Vite, Tailwind CSS, and Firebase Firestore.

## Features

### 1. **Event Management**
- Create events with title, description, location, start/end dates and times
- Toggle public/private status for events
- Real-time updates using Firebase Firestore listeners
- Automatic validation (end date must be after start date)

### 2. **Public Events Page**
- Browse all public events
- View events in a modern monthly calendar grid
- See "Happening Now" and "Upcoming Next" events in a sidebar
- Click on calendar dates to see events for that day
- Color-coded event badges (green for current, blue for upcoming)
- Responsive design that works on all devices

### 3. **Admin Event Management**
- Tab-based interface to add events or view all events
- Yearly overview showing all events for the current year
- Quick visual indication of event counts per month
- Add, view, and organize events efficiently

### 4. **Event Categorization**
- **Current**: Events happening right now
- **Upcoming**: Events with a future start date
- **Past**: Events that have already ended

## Project Structure

```
src/
├── components/
│   ├── AddEventForm.tsx          # Form for adding new events
│   ├── MonthlyCalendar.tsx       # Calendar grid view
│   └── YearlyView.tsx            # Yearly events overview
├── pages/
│   ├── PublicEventsPage.tsx      # Public-facing events page
│   └── AdminEventsPage.tsx       # Admin event management
├── utils/
│   ├── firebaseUtils.ts          # Firebase CRUD operations
│   └── eventUtils.ts             # Event processing & formatting
├── config/
│   └── firebase.ts               # Firebase initialization
├── App.tsx                       # Main app with mode toggle
└── main.tsx                      # Entry point
```

## Firebase Data Structure

### Collection: `events`

Each event document contains:

```typescript
{
  id: string (auto-generated)
  title: string
  description: string
  startDate: Timestamp
  endDate: Timestamp
  location: string
  isPublic: boolean
  createdAt: Timestamp (auto-generated)
  updatedAt: Timestamp (auto-generated)
}
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase

Create a `.env.local` file in the root directory with your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Set up Firestore Database

1. Go to Firebase Console
2. Create a Firestore Database
3. Create a collection called `events`
4. Set security rules:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public events can be read by anyone
    match /events/{event} {
      allow read: if resource.data.isPublic == true;
      allow write: if request.auth != null; // Only authenticated users can write
    }
  }
}
```

### 4. Run Development Server

```bash
npm run dev
```

The app will start at `http://localhost:5173`

## Usage

### Public View
- Visit the app in public mode (default)
- Browse all public events
- View calendar and event details
- Filter by date by clicking on calendar dates

### Admin View
- Click "Switch to Admin" button in top-right
- **Add Event Tab**: Create new events with form validation
- **View Events Tab**: See all events in a yearly overview
- Success toast notifications confirm event creation
- Switch back to public view to see your events

## Key Functions

### Firebase Utils (`firebaseUtils.ts`)

```typescript
// Add a new event
addEvent(event: Event) => Promise<string>

// Get all events (with optional public-only filter)
getEvents(publicOnly?: boolean) => Promise<Event[]>

// Real-time event listener
subscribeToEvents(callback: Function, publicOnly?: boolean) => () => void

// Get events on a specific date
subscribeToEventsOnDate(date: Date, callback: Function, publicOnly?: boolean) => () => void
```

### Event Utils (`eventUtils.ts`)

```typescript
// Categorize events into current, upcoming, and past
categorizeEvents(events: Event[]) => CategorizedEvents

// Get events for a specific date
getEventsOnDate(events: Event[], date: Date) => Event[]

// Get events in a specific month
getEventsInMonth(events: Event[], year: number, month: number) => Event[]

// Format dates for display
formatEventDate(date: Timestamp | Date) => string
formatEventDateTime(date: Timestamp | Date) => string
```

## Components

### AddEventForm
- Modern, clean form with Tailwind styling
- Input fields for all event details
- Date/time picker inputs
- Validation for end date after start date
- Loading states and error handling
- Success toast notifications

### MonthlyCalendar
- 7-column grid showing the current month
- Click on dates to filter events
- Color-coded event badges
- Navigation buttons (Prev, Today, Next)
- Legend showing event status colors
- Event count indicators

### YearlyView
- All 12 months displayed in a responsive grid
- Event cards for each month
- Scrollable event lists per month
- Compact card design
- Status colors and location indicators

### PublicEventsPage
- Sidebar with "Happening Now" and "Upcoming Next" sections
- Main calendar view
- Selected date event listing
- Error and loading states
- Responsive layout (stacks on mobile)

### AdminEventsPage
- Tab navigation between Add and View modes
- Integrates AddEventForm and YearlyView
- Event count display
- Professional admin interface

## Styling

The entire app uses Tailwind CSS utility classes for:
- Consistent color palette (blue, green, purple, gray)
- Responsive grid layouts
- Smooth transitions and hover effects
- Clean typography hierarchy
- Professional shadows and borders

## Technologies Used

- **React 19** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Firebase** - Backend and Firestore database
- **date-fns** - Date utility library
- **react-hot-toast** - Toast notifications

## Tips & Best Practices

1. **Always convert Timestamps**: Use the `toDate()` method on Firestore Timestamps
2. **Real-time Updates**: Components automatically update when events change in Firestore
3. **Public vs Private**: The public page only shows events with `isPublic: true`
4. **Validation**: Always validate date/time inputs before submission
5. **Error Handling**: All Firebase operations are wrapped in try-catch blocks

## Future Enhancements

- User authentication and accounts
- Event editing and deletion
- Event search and filtering
- Category/tag system
- Event reminders and notifications
- Recurring events
- Export to iCal/Google Calendar
- Multi-language support
- Dark mode toggle

## License

MIT

## Support

For issues or questions, please create an issue in the repository.
