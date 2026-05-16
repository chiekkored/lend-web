import {
  AlertTriangle,
  BarChart3,
  CalendarClock,
  CircleDollarSign,
  ClipboardList,
  Flag,
  LayoutDashboard,
  ListChecks,
  MessageSquareText,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Users,
  UserCheck,
  UserCog,
} from "lucide-react";

export const adminNavItems = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Listings", href: "/admin/listings", icon: ShoppingBag },
  { title: "Bookings", href: "/admin/bookings", icon: CalendarClock },
  { title: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { title: "Settings", href: "/admin/settings", icon: Settings },
];

const adminReportsNavGroup = {
  title: "Reports",
  icon: Flag,
  items: [
    {
      title: "User Reports",
      href: "/admin/reports/users",
      icon: Users,
    },
    {
      title: "Listing Reports",
      href: "/admin/reports/listings",
      icon: ShoppingBag,
    },
    {
      title: "Message Reports",
      href: "/admin/reports/messages",
      icon: MessageSquareText,
    },
    {
      title: "Other Reports",
      href: "/admin/reports/other",
      icon: ClipboardList,
    },
  ],
} as const;

const adminUsersNavGroup = {
  title: "Users",
  icon: Users,
  items: [
    {
      title: "Verifications List",
      href: "/admin/users/verifications",
      icon: UserCheck,
    },
    {
      title: "Admin Users",
      href: "/admin/users/admin-users",
      icon: UserCog,
    },
    {
      title: "All Users",
      href: "/admin/users/all-users",
      icon: Users,
    },
    {
      title: "Account Feedback",
      href: "/admin/account-feedback",
      icon: ClipboardList,
    },
  ],
} as const;

export const adminSidebarGroups = [
  {
    title: "General",
    items: [
      { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { title: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Assets",
    items: [
      { title: "Listings", href: "/admin/listings", icon: ShoppingBag },
      { title: "Bookings", href: "/admin/bookings", icon: CalendarClock },
    ],
  },
  {
    title: "Moderation",
    groups: [adminReportsNavGroup],
  },
  {
    title: "Accounts",
    groups: [adminUsersNavGroup],
  },
  {
    title: "System",
    items: [{ title: "Settings", href: "/admin/settings", icon: Settings }],
  },
] as const;

export const summaryCards = [
  {
    label: "Total Users",
    value: "18,420",
    change: "+8.4% this month",
    icon: Users,
  },
  {
    label: "Active Rentals",
    value: "1,286",
    change: "+124 week over week",
    icon: ListChecks,
  },
  {
    label: "Active Listings",
    value: "5,903",
    change: "312 pending review",
    icon: ShoppingBag,
  },
  {
    label: "Monthly Revenue",
    value: "$82,450",
    change: "+14.8% from April",
    icon: CircleDollarSign,
  },
  {
    label: "Pending Reports",
    value: "47",
    change: "9 marked critical",
    icon: AlertTriangle,
  },
  {
    label: "Pending Approvals",
    value: "138",
    change: "Listings and verifications",
    icon: ShieldCheck,
  },
];

export const dashboardRows = [
  {
    id: "BK-1048",
    item: "Canon EOS R7 Kit",
    owner: "Mika Reyes",
    renter: "Andre Santos",
    status: "Active",
    date: "May 14, 2026",
  },
  {
    id: "RP-2403",
    item: "Reported message",
    owner: "Safety Queue",
    renter: "Nina Cruz",
    status: "Under Review",
    date: "May 14, 2026",
  },
  {
    id: "LS-9122",
    item: "DJI Mini 4 Pro",
    owner: "Ramon Lim",
    renter: "Listing Review",
    status: "Pending",
    date: "May 13, 2026",
  },
  {
    id: "USR-6621",
    item: "New owner verification",
    owner: "Kaila Torres",
    renter: "Trust Team",
    status: "Pending",
    date: "May 13, 2026",
  },
];

export const sectionContent = {
  users: {
    title: "Users",
    description: "Manage renter and owner accounts, verification, and account status.",
    filters: ["All roles", "Verified", "Suspended", "Banned"],
    columns: ["User ID", "Full Name", "Email", "Role", "Verification", "Status"],
    rows: [
      ["USR-1001", "Mika Reyes", "mika@example.com", "Owner", "Verified", "Active"],
      ["USR-1002", "Andre Santos", "andre@example.com", "Renter", "Pending", "Active"],
      ["USR-1003", "Nina Cruz", "nina@example.com", "Owner", "Verified", "Suspended"],
    ],
  },
  listings: {
    title: "Listings",
    description: "Review rental assets, approval state, availability, pricing, and reports.",
    filters: ["All categories", "Pending", "Approved", "Reported"],
    columns: ["Listing ID", "Asset", "Category", "Owner", "Price", "Status"],
    rows: [
      ["LS-9122", "DJI Mini 4 Pro", "Camera", "Ramon Lim", "$52/day", "Pending"],
      ["LS-9021", "Yamaha Stagepas", "Audio", "Mika Reyes", "$48/day", "Approved"],
      ["LS-8998", "Makita Drill Set", "Tools", "Kaila Torres", "$18/day", "Reported"],
    ],
  },
  bookings: {
    title: "Bookings",
    description: "Track rental status, cancellation requests, disputes, and transaction health.",
    filters: ["All statuses", "Pending", "Active", "Completed", "Disputed"],
    columns: ["Booking ID", "Asset", "Owner", "Renter", "Amount", "Status"],
    rows: [
      ["BK-1048", "Canon EOS R7 Kit", "Mika Reyes", "Andre Santos", "$156", "Active"],
      ["BK-1047", "DJI Mini 4 Pro", "Ramon Lim", "Nina Cruz", "$104", "Pending"],
      ["BK-1038", "Projector XGIMI", "Kaila Torres", "Paolo Dizon", "$75", "Completed"],
    ],
  },
  reports: {
    title: "Reports",
    description: "Moderate reports for users, listings, messages, fraud, disputes, and abuse.",
    filters: ["Open", "Under Review", "Resolved", "Critical"],
    columns: ["Report ID", "Type", "Entity", "Reporter", "Priority", "Status"],
    rows: [
      ["RP-2403", "Reported Message", "Chat BK-1048", "Nina Cruz", "High", "Under Review"],
      ["RP-2399", "Reported Listing", "LS-8998", "Andre Santos", "Medium", "Open"],
      ["RP-2388", "Payment Dispute", "BK-1022", "Kaila Torres", "Critical", "Open"],
    ],
  },
  analytics: {
    title: "Analytics",
    description: "Monitor platform growth, revenue, bookings, disputes, and category demand.",
    filters: ["Last 7 days", "Last 30 days", "This quarter", "This year"],
    columns: ["Metric", "Current", "Previous", "Change", "Owner", "Status"],
    rows: [
      ["Daily active users", "3,412", "3,128", "+9.1%", "Growth", "Healthy"],
      ["Booking conversion", "18.4%", "16.9%", "+1.5 pts", "Marketplace", "Healthy"],
      ["Dispute rate", "1.8%", "2.3%", "-0.5 pts", "Safety", "Improving"],
    ],
  },
  settings: {
    title: "Settings",
    description: "Configure platform, rental rules, user verification, notifications, and security.",
    filters: ["General", "Rental", "Users", "Notifications", "Security"],
    columns: ["Setting", "Current Value", "Owner", "Last Updated", "Review", "Status"],
    rows: [
      ["Commission percentage", "12%", "Finance", "May 12, 2026", "Quarterly", "Active"],
      ["Maintenance mode", "Off", "Platform", "May 10, 2026", "Manual", "Active"],
      ["Admin session timeout", "8 hours", "Security", "May 08, 2026", "Monthly", "Active"],
    ],
  },
} as const;

export type AdminSection = keyof typeof sectionContent;

export function isAdminSection(value: string): value is AdminSection {
  return value in sectionContent;
}
