"use client";

import * as React from "react";

import { listenListingDeactivationRequestsPage } from "../data/deactivation-request-queries";

const sidebarPendingRequestLimit = 50;

export function usePendingDeactivationRequestIndicator() {
  const [ids, setIds] = React.useState<string[]>([]);

  React.useEffect(
    () =>
      listenListingDeactivationRequestsPage({
        pageSize: sidebarPendingRequestLimit,
        statusFilter: "Pending",
        onError: (error) => {
          console.error(
            "[listing-deactivation] sidebar pending listener failed",
            error,
          );
          setIds([]);
        },
        onNext: (page) => {
          setIds(page.items.map((request) => request.id));
        },
      }),
    [],
  );

  return { ids };
}
