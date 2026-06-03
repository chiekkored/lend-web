"use client";

import { AllListingTable } from "./components/all-listing-table";
import { useAllListings } from "./hooks/use-all-listings";

export function AllListingsPage() {
  const { data, error, loading, pagination } = useAllListings();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-normal">
          All listings
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Review rental assets, availability, pricing, and listing status.
        </p>
      </div>

      <AllListingTable
        data={data}
        error={error}
        loading={loading}
        pagination={pagination}
      />
    </div>
  );
}
