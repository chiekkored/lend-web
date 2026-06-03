"use client";

import * as React from "react";

import type { ListingDeactivationRequest } from "./data/deactivation-request-queries";
import { DeactivationRequestTable } from "./components/deactivation-request-table";
import { DeactivationRequestViewSheet } from "./components/deactivation-request-view-sheet";
import { useListingDeactivationRequests } from "./hooks/use-listing-deactivation-requests";

export function ListingDeactivationRequestsPage() {
  const {
    data,
    error,
    loading,
    pagination,
    setStatusFilter,
    statusFilter,
  } = useListingDeactivationRequests();
  const [selected, setSelected] =
    React.useState<ListingDeactivationRequest | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-normal">
          Listing deactivation requests
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Review owner requests to permanently archive damaged or force majeure
          listings and cancel upcoming bookings.
        </p>
      </div>

      <DeactivationRequestTable
        data={data}
        error={error}
        filterValue={statusFilter}
        loading={loading}
        onFilterChange={setStatusFilter}
        onView={setSelected}
        pagination={pagination}
      />
      <DeactivationRequestViewSheet
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        open={selected != null}
        request={selected}
      />
    </div>
  );
}
