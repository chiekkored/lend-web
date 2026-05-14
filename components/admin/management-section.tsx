import { Download, ExternalLink, Filter, MoreVerticalIcon, Search } from "lucide-react";

import { isStatusValue, StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type AdminSection, sectionContent } from "@/lib/admin-data";

export function ManagementSection({ section }: { section: AdminSection }) {
  const content = sectionContent[section];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-normal">
            {content.title} management
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            {content.description}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download />
            Export
          </Button>
          <Button>
            <Filter />
            Review queue
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder={`Search ${content.title.toLowerCase()}`} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            {content.filters.map((filter) => (
              <Button key={filter} size="sm" variant="outline">
                {filter}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {content.columns.map((column) => (
                  <TableHead key={column}>{column}</TableHead>
                ))}
                <TableHead className="w-16 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {content.rows.map((row) => (
                <TableRow key={row[0]}>
                  {row.map((cell, index) => (
                    <TableCell
                      className={index === 0 ? "font-medium" : undefined}
                      key={`${row[0]}-${cell}`}
                    >
                      {isStatusValue(cell) ? (
                        <StatusBadge value={cell} />
                      ) : (
                        cell
                      )}
                    </TableCell>
                  ))}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-label="Open row actions" size="icon" variant="ghost">
                          <MoreVerticalIcon />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <ExternalLink />
                          View details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>Showing 3 of 3 records</span>
            <div className="flex gap-2">
              <Button disabled size="sm" variant="outline">
                Previous
              </Button>
              <Button disabled size="sm" variant="outline">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
