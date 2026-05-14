"use client";

import { ListingTable } from "./components";
import { useListings } from "./hooks/use-listings";

export function ListingsPage() {
  const { data, error, loading } = useListings();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-normal">
          Listings management
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Review rental assets, approval state, availability, pricing, and reports.
        </p>
      </div>
      <ListingTable data={data} error={error} loading={loading} />
    </div>
  );
}
