"use client";

import { AdminDataTable } from "@/components/admin/admin-data-table";
import type { AdminListing } from "@/lib/admin-listings";

import { useListingColumns } from "./listing-columns";

type ListingTableProps = {
  data: AdminListing[];
  error: string | null;
  loading: boolean;
};

export function ListingTable({ data, error, loading }: ListingTableProps) {
  const columns = useListingColumns();

  return (
    <AdminDataTable
      columns={columns}
      data={data}
      emptyMessage="No listings match this view."
      error={error}
      loading={loading}
      searchPlaceholder="Search listings"
    />
  );
}
