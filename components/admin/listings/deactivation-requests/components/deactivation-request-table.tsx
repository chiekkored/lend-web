"use client";

import {
  AdminDataTable,
  type AdminDataTablePaginationProps,
} from "@/components/admin/admin-data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  listingDeactivationRequestStatusFilterOptions,
  type ListingDeactivationRequest,
  type ListingDeactivationRequestStatusFilter,
} from "../data/deactivation-request-queries";
import { getDeactivationRequestColumns } from "./deactivation-request-columns";

export function DeactivationRequestTable({
  data,
  error,
  filterValue,
  loading,
  onFilterChange,
  onView,
  pagination,
}: {
  data: ListingDeactivationRequest[];
  error: string | null;
  filterValue: ListingDeactivationRequestStatusFilter;
  loading: boolean;
  onFilterChange: (value: ListingDeactivationRequestStatusFilter) => void;
  onView: (request: ListingDeactivationRequest) => void;
  pagination: AdminDataTablePaginationProps;
}) {
  const toolbarFilter = (
    <Select
      onValueChange={(value) =>
        onFilterChange(value as ListingDeactivationRequestStatusFilter)
      }
      value={filterValue}
    >
      <SelectTrigger
        aria-label="Filter deactivation requests"
        className="w-full sm:w-40"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {listingDeactivationRequestStatusFilterOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <AdminDataTable
      columns={getDeactivationRequestColumns({ onView })}
      data={data}
      emptyMessage="No listing deactivation requests found."
      error={error}
      loading={loading}
      pagination={pagination}
      primaryColumnId="listing"
      searchPlaceholder="Search deactivation requests"
      storageKey="admin-listing-deactivation-request-table"
      toolbarFilter={toolbarFilter}
    />
  );
}
