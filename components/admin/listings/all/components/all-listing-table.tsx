"use client";

import type { AdminDataTablePaginationProps } from "@/components/admin/admin-data-table";
import { ListingTable } from "@/components/admin/listings/components";
import type { AdminListing } from "@/lib/admin-listings";

type AllListingTableProps = {
  data: AdminListing[];
  error: string | null;
  loading: boolean;
  pagination: AdminDataTablePaginationProps;
};

export function AllListingTable({
  data,
  error,
  loading,
  pagination,
}: AllListingTableProps) {
  return (
    <ListingTable
      data={data}
      error={error}
      loading={loading}
      pagination={pagination}
    />
  );
}
