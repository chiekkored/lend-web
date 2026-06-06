"use client";

import type { AdminDataTablePaginationProps } from "@/components/admin/admin-data-table";
import { ListingTable } from "@/components/admin/listings/components";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AdminListing } from "@/lib/admin-listings";

import {
  allListingStatusFilterOptions,
  type AllListingStatusFilter,
} from "../data/all-listing-queries";

type AllListingTableProps = {
  data: AdminListing[];
  error: string | null;
  filterValue: AllListingStatusFilter;
  loading: boolean;
  onFilterChange: (value: AllListingStatusFilter) => void;
  pagination: AdminDataTablePaginationProps;
};

export function AllListingTable({
  data,
  error,
  filterValue,
  loading,
  onFilterChange,
  pagination,
}: AllListingTableProps) {
  const toolbarFilter = (
    <Select
      onValueChange={(value) => onFilterChange(value as AllListingStatusFilter)}
      value={filterValue}
    >
      <SelectTrigger aria-label="Filter listings by status" className="w-full sm:w-44">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {allListingStatusFilterOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <ListingTable
      data={data}
      error={error}
      loading={loading}
      pagination={pagination}
      toolbarFilter={toolbarFilter}
    />
  );
}
