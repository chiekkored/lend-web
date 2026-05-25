"use client";

import {
  AdminDataTable,
  type AdminDataTablePaginationProps,
} from "@/components/admin/admin-data-table";
import type { AdminListing } from "@/lib/admin-listings";

import { useListingColumns } from "./listing-columns";

type ListingTableProps = {
  data: AdminListing[];
  error: string | null;
  loading: boolean;
  pagination?: AdminDataTablePaginationProps;
};

export function ListingTable({ data, error, loading, pagination }: ListingTableProps) {
  const columns = useListingColumns();

  return (
    <AdminDataTable
      columns={columns}
      data={data}
      emptyMessage="No listings match this view."
      error={error}
      loading={loading}
      pagination={pagination}
      primaryColumnId="asset"
      searchPlaceholder="Search listings"
      storageKey="admin:listings:column-visibility"
    />
  );
}
