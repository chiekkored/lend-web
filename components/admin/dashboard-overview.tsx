import { Search } from "lucide-react";

import {
  CategoryActivityChart,
  RevenueOverviewChart,
} from "@/components/admin/dashboard-chart";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { dashboardRows, summaryCards } from "@/lib/admin-data";

export function DashboardOverview() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-normal">
            Platform overview
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Activity, moderation, revenue, and approval queues.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative w-full md:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search operations" />
          </div>
          <Button variant="outline">Export</Button>
        </div>
      </div>

      <section className="grid admin-page-grid gap-4">
        {summaryCards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardDescription>{card.label}</CardDescription>
                <CardTitle className="mt-2 text-2xl">{card.value}</CardTitle>
              </div>
              <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <card.icon className="size-5" />
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {card.change}
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Revenue overview</CardTitle>
            <CardDescription>
              Monthly rental revenue for completed and active bookings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueOverviewChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Most active categories</CardTitle>
            <CardDescription>
              Booking activity by top listing categories.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryActivityChart />
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>
            Latest registrations, reports, bookings, and review queues.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dashboardRows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.id}</TableCell>
                  <TableCell>{row.item}</TableCell>
                  <TableCell>{row.owner}</TableCell>
                  <TableCell>{row.renter}</TableCell>
                  <TableCell>
                    <StatusBadge value={row.status} />
                  </TableCell>
                  <TableCell>{row.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
