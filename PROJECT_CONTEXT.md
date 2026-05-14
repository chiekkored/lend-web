# Admin Web App Documentation
## Rental Marketplace Admin Panel

## Tech Stack
- Framework: Next.js
- UI Components: shadcn/ui
- Styling: Tailwind CSS
- State Management: Zustand or React Query
- Backend: Firebase / Existing Backend APIs
- Charts: Recharts
- Tables: TanStack Table
- Form Handling: React Hook Form + Zod

---

# Design System Notes

This admin panel should use:
- shadcn/ui components
- clean modern SaaS dashboard design
- responsive desktop-first layout
- sidebar navigation
- top navbar
- card-based dashboard
- data tables with filters and pagination
- modal dialogs for actions
- toast notifications
- tabs for grouped content
- sheet/drawer for detail preview
- badges for statuses
- charts and analytics widgets

Recommended shadcn components:
- Card
- Data Table
- Tabs
- Dialog
- Sheet
- Dropdown Menu
- Tooltip
- Badge
- Avatar
- Alert Dialog
- Pagination
- Select
- Input
- Calendar
- Skeleton
- Toast
- Separator

---

# Sidebar Navigation

- Dashboard
- Users
- Listings
- Bookings
- Reports
- Analytics
- Settings

---

# 1. Dashboard Page

## Purpose
Provide admins a quick overview of platform activity, health, and business metrics.

## Layout
- Summary cards at top
- Charts in middle
- Recent activities table below

## Summary Cards
- Total Users
- Active Rentals
- Active Listings
- Monthly Revenue
- Pending Reports
- Pending Approvals

## Charts
- Revenue Overview
- Booking Trends
- User Growth
- Most Active Categories

## Widgets
- Recent Registrations
- Recent Reports
- Latest Bookings
- System Status

## Suggested Components
- Card
- Badge
- Chart
- Table
- Tabs

---

# 2. Users Management Page

## Purpose
Manage renter and owner accounts.

## Features
- View all users
- Search users
- Filter by role
- Filter by status
- Suspend account
- Ban account
- Reactivate account
- View user details

## Table Columns
- User ID
- Profile Photo
- Full Name
- Email
- Role
- Verification Status
- Joined Date
- Account Status
- Actions

## User Detail Drawer
### Sections
- Personal Information
- Rental History
- Listed Assets
- Reports History
- Payment Activity

## Actions
- Suspend User
- Ban User
- Verify User
- Reset Password
- View Reports

## Suggested Components
- Data Table
- Avatar
- Dialog
- Sheet
- Tabs
- Badge

---

# 3. Listings Management Page

## Purpose
Manage all rental asset listings.

## Features
- Approve listings
- Reject listings
- Edit listing
- Remove listing
- View listing details
- Filter by category
- Filter by owner
- Filter by status

## Listing Status
- Pending
- Approved
- Rejected
- Reported
- Archived

## Table Columns
- Listing ID
- Asset Thumbnail
- Asset Name
- Category
- Owner
- Price
- Availability
- Status
- Created Date
- Actions

## Listing Detail View
### Sections
- Asset Information
- Images Gallery
- Pricing Details
- Booking History
- Reports
- Owner Information

## Actions
- Approve
- Reject
- Archive
- Delete
- Feature Listing

## Suggested Components
- Data Table
- Carousel
- Dialog
- Tabs
- Badge
- Dropdown Menu

---

# 4. Bookings Management Page

## Purpose
Track all rental transactions and booking flows.

## Features
- View bookings
- View rental status
- Monitor disputes
- Cancel bookings
- View booking timeline

## Booking Status
- Pending
- Approved
- Active
- Completed
- Cancelled
- Disputed

## Table Columns
- Booking ID
- Asset
- Owner
- Renter
- Start Date
- End Date
- Total Amount
- Status
- Created Date
- Actions

## Booking Detail Page
### Sections
- Booking Information
- Asset Information
- Chat Reference
- Payment Details
- Timeline Activity
- Dispute History

## Actions
- Approve Booking
- Cancel Booking
- Refund Payment
- Mark Completed
- Open Dispute

## Suggested Components
- Timeline
- Card
- Tabs
- Dialog
- Badge
- Table

---

# 5. Reports Page

## Purpose
Central moderation system for platform safety and abuse handling.

## Report Types
- Reported User
- Reported Listing
- Reported Message
- Fraud Report
- Scam Activity
- Payment Dispute
- Inappropriate Content
- Harassment

## Features
- View reports
- Assign priority
- Resolve reports
- Dismiss reports
- Suspend related entities
- View evidence

## Report Status
- Open
- Under Review
- Resolved
- Dismissed

## Priority Levels
- Low
- Medium
- High
- Critical

## Table Columns
- Report ID
- Report Type
- Reported Entity
- Reporter
- Reason
- Priority
- Status
- Submitted Date
- Actions

## Report Detail Drawer
### Sections
- Report Information
- Attached Evidence
- Related User
- Related Listing
- Chat Messages
- Admin Notes
- Resolution History

## Admin Actions
- Mark Reviewed
- Suspend User
- Remove Listing
- Dismiss Report
- Escalate Case

## Suggested Components
- Data Table
- Tabs
- Alert Dialog
- Badge
- Sheet
- Accordion

---

# 6. Analytics Page

## Purpose
Display business insights and platform performance.

## Metrics
- Daily Active Users
- Monthly Revenue
- Booking Conversion Rate
- Most Popular Categories
- Top Performing Listings
- Cancellation Rate
- Dispute Rate
- Revenue Growth
- User Growth

## Charts
- Revenue Chart
- User Growth Chart
- Bookings Per Month
- Category Distribution
- Top Locations

## Filters
- Date Range
- Category
- User Role
- Status

## Suggested Components
- Recharts
- Card
- Tabs
- Select
- Calendar
- Tooltip

---

# 7. Settings Page

## Purpose
Manage platform-wide configurations.

## Sections
### General Settings
- Platform Name
- Logo
- Maintenance Mode

### Rental Settings
- Commission Percentage
- Booking Limits
- Cancellation Rules

### User Settings
- Verification Requirements
- Default Roles

### Notification Settings
- Email Notifications
- Push Notifications
- Admin Alerts

### Security Settings
- Admin Access Roles
- Session Timeout
- Audit Logs

## Suggested Components
- Form
- Switch
- Input
- Select
- Tabs
- Dialog

---

# Common UI Patterns

## Status Badges
Use badge colors consistently:
- Green = Approved / Active / Resolved
- Yellow = Pending / Review
- Red = Rejected / Critical / Suspended
- Gray = Archived / Disabled

## Tables
All tables should support:
- pagination
- sorting
- filtering
- search
- bulk actions
- row selection

## Responsive Design
- Desktop optimized
- Tablet compatible
- Sidebar collapsible
- Mobile fallback support

---

# Recommended Folder Structure

```bash
/app
  /dashboard
  /users
  /listings
  /bookings
  /reports
  /analytics
  /settings

/components
  /tables
  /charts
  /dialogs
  /forms
  /layout

/lib
/services
/hooks
/types