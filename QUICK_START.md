# Quick Start Guide - Event Management System

## What You've Built

A complete event management system with:
- ✅ Firebase Firestore integration
- ✅ Real-time event updates
- ✅ Public event viewing page with calendar
- ✅ Admin page for adding and managing events
- ✅ Event categorization (Current, Upcoming, Past)
- ✅ Beautiful Tailwind CSS styling
- ✅ Form validation and toast notifications

## Important: Next Steps to Make It Work

### 1. Set Up Firebase (Required)

**The app won't fully work until you connect it to Firebase!**

1. **Create a Firebase Project**
   - Go to https://console.firebase.google.com/
   - Click "Add Project"
   - Follow the setup wizard

2. **Create a Firestore Database**
   - In your Firebase project, go to "Firestore Database"
   - Click "Create Database"
   - Choose "Start in test mode" for now
   - Select your region

3. **Get Your Firebase Config**
   - Go to Project Settings (gear icon)
   - Scroll down to "Your apps"
   - Click the web icon (`</>`) to add a web app
   - Register your app
   - Copy the Firebase configuration

4. **Add Config to Your App**
   - Copy `.env.example` to `.env.local`
   - Paste your Firebase credentials into `.env.local`
   - Restart the dev server (`npm run dev`)

### 2. Test the Application

Once Firebase is configured:

#### Testing the Public Page (Default View)
1. Open http://localhost:5173
2. You'll see the calendar view
3. Sidebar shows "Happening Now" and "Upcoming Next" sections
4. Calendar displays events as colored badges
5. Click dates to filter events

#### Testing the Admin Page
1. Click "Switch to Admin" button (top right)
2. **Add Event Tab**:
   - Fill in the event form
   - Try setting end date before start date → validation error
   - Submit a valid event → success toast
3. **View Events Tab**:
   - See your new event in the yearly view
   - Events are organized by month

### 3. Add Sample Events

To test the system, add these sample events:

**Event 1: Current Event**
- Title: "Tech Conference 2025"
- Description: "Annual technology conference"
- Start: Today's date, 9:00 AM
- End: Today's date, 5:00 PM
- Location: "Convention Center"
- Public: ✓

**Event 2: Upcoming Event**
- Title: "Product Launch"
- Description: "New product unveiling"
- Start: Tomorrow, 2:00 PM
- End: Tomorrow, 4:00 PM
- Location: "Virtual"
- Public: ✓

**Event 3: Multi-Day Event**
- Title: "Summer Festival"
- Description: "Week-long celebration"
- Start: Next week Monday, 10:00 AM
- End: Next week Friday, 10:00 PM
- Location: "City Park"
- Public: ✓

### 4. Explore Features

#### Calendar Features
- Click on any date to see events for that day
- Use Prev/Next buttons to navigate months
- Click "Today" to return to current month
- Events are color-coded:
  - 🟢 Green = Happening Now
  - 🔵 Blue = Upcoming
  - ⚪ Gray = Past

#### Admin Features
- Switch between "Add Event" and "View Events" tabs
- Form automatically validates dates
- Real-time updates show instantly in both views
- Toast notifications confirm actions

### 5. Customize the App

#### Change Colors
Edit Tailwind classes in the components:
- Public page: Blue/Indigo theme
- Admin page: Purple theme
- Current events: Green
- Upcoming events: Blue

#### Modify Event Fields
Add new fields in:
1. `src/utils/firebaseUtils.ts` - Event interface
2. `src/components/AddEventForm.tsx` - Form inputs
3. Update display components

#### Add Authentication
Install Firebase Auth and protect the admin page:
```bash
npm install firebase
```

Then add auth logic to `AdminEventsPage.tsx`

## Project File Structure

```
src/
├── components/          # Reusable UI components
│   ├── AddEventForm.tsx
│   ├── MonthlyCalendar.tsx
│   └── YearlyView.tsx
│
├── pages/              # Full page views
│   ├── PublicEventsPage.tsx
│   └── AdminEventsPage.tsx
│
├── utils/              # Helper functions
│   ├── firebaseUtils.ts    # Database operations
│   └── eventUtils.ts       # Event logic
│
├── config/             # Configuration
│   └── firebase.ts
│
└── App.tsx            # Main app with mode toggle
```

## Common Issues & Solutions

### Issue: "Failed to load events"
**Solution**: Check your Firebase configuration in `.env.local`

### Issue: Events not showing up
**Solution**: 
1. Check Firestore security rules
2. Ensure events have `isPublic: true` for public page
3. Check browser console for errors

### Issue: Validation errors on form
**Solution**: Make sure end date/time is after start date/time

### Issue: Tailwind styles not working
**Solution**: Restart the dev server after changing `tailwind.config.js`

## Firebase Security Rules

For production, update your Firestore rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /events/{event} {
      // Anyone can read public events
      allow read: if resource.data.isPublic == true;
      
      // Only authenticated users can write
      allow create, update, delete: if request.auth != null;
    }
  }
}
```

## Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## What's Next?

### Immediate Enhancements
- Add event editing functionality
- Add event deletion with confirmation
- Add event search/filter
- Add pagination for large event lists

### Advanced Features
- User authentication (Firebase Auth)
- Event categories/tags
- Image uploads for events
- Email notifications
- Export events to calendar formats
- Recurring events
- Event RSVP system

## Support Resources

- **Firebase Docs**: https://firebase.google.com/docs/firestore
- **Tailwind Docs**: https://tailwindcss.com/docs
- **date-fns Docs**: https://date-fns.org/docs
- **React Docs**: https://react.dev

## Need Help?

The app is fully functional once Firebase is configured. If you run into issues:
1. Check the browser console for errors
2. Verify your `.env.local` file
3. Check Firestore rules in Firebase Console
4. Ensure the Firestore collection is named "events"

Happy event managing! 🎉
