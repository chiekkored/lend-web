"use client";

import * as React from "react";

import {
  isDamageFeeBooking,
  isPendingDamageBooking,
  type AdminBooking,
} from "@/lib/admin-bookings";
import {
  useAdminCursorPagination,
  type AdminCursor,
  type AdminCursorPage,
} from "@/lib/helpers/use-admin-cursor-pagination";

import {
  fetchAdminBookingsPage,
  listenPendingDamageBookings,
} from "../data/booking-queries";

export function usePendingDamageBookings({
  enabled = true,
}: {
  enabled?: boolean;
} = {}) {
  const fetchPage = React.useCallback(async (input: Parameters<typeof fetchAdminBookingsPage>[0]) => {
    const page = await fetchAdminBookingsPage(input);
    return {
      ...page,
      items: page.items.filter(isDamageFeeBooking),
    };
  }, []);
  const listenFirstPage = React.useCallback(
    ({
      onError,
      onNext,
      pageSize,
    }: {
      onError: (error: Error) => void;
      onNext: (page: AdminCursorPage<AdminBooking>) => void;
      pageSize: number;
    }) => {
      const sourceSnapshots = new Map<number, AdminCursorPage<AdminBooking>>();
      return listenPendingDamageBookings({
        pageSize,
        onError,
        onNext: (sourceIndex, page) => {
          sourceSnapshots.set(sourceIndex, page);
          onNext(combinePendingDamagePages(sourceSnapshots));
        },
      });
    },
    [],
  );
  const pendingDamage = useAdminCursorPagination({
    enabled,
    fetchPage,
    listenFirstPage,
  });

  return {
    data: pendingDamage.data,
    error: pendingDamage.error,
    loading: pendingDamage.loading,
    pagination: pendingDamage.pagination,
  };
}

export function usePendingDamageNotification({
  enabled = true,
  isViewingPendingDamage = false,
}: {
  enabled?: boolean;
  isViewingPendingDamage?: boolean;
} = {}) {
  const { data } = usePendingDamageBookings({ enabled });
  const pendingIds = React.useMemo(
    () => data.filter(isPendingDamageBooking).map((booking) => booking.id),
    [data],
  );
  const [hasNewPendingDamage, setHasNewPendingDamage] = React.useState(false);

  React.useEffect(() => {
    if (!enabled) {
      return;
    }

    const currentIds = new Set(pendingIds);
    const seenIds = readSeenPendingDamageIds();

    if (!seenIds) {
      writeSeenPendingDamageIds(currentIds);
      setHasNewPendingDamage(false);
      return;
    }

    if (isViewingPendingDamage) {
      writeSeenPendingDamageIds(currentIds);
      setHasNewPendingDamage(false);
      return;
    }

    setHasNewPendingDamage(
      pendingIds.some((bookingId) => !seenIds.has(bookingId)),
    );
  }, [enabled, isViewingPendingDamage, pendingIds]);

  return { hasNewPendingDamage };
}

function combinePendingDamagePages(
  sourceSnapshots: Map<number, AdminCursorPage<AdminBooking>>,
): AdminCursorPage<AdminBooking> {
  const byId = new Map<string, AdminBooking>();
  let hasMore = false;
  let lastCursor: AdminCursor = null;

  sourceSnapshots.forEach((page) => {
    hasMore = hasMore || page.hasMore;
    lastCursor = page.lastCursor ?? lastCursor;
    page.items.forEach((booking) => {
      if (isDamageFeeBooking(booking)) {
        byId.set(booking.id, booking);
      }
    });
  });

  return {
    hasMore,
    items: Array.from(byId.values()).sort(
      (left, right) =>
        (right.createdAt?.getTime() ?? 0) - (left.createdAt?.getTime() ?? 0),
    ),
    lastCursor,
  };
}

function readSeenPendingDamageIds() {
  if (typeof window === "undefined") {
    return new Set<string>();
  }

  const rawValue = window.localStorage.getItem(
    PENDING_DAMAGE_SEEN_STORAGE_KEY,
  );
  if (!rawValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(rawValue);
    return new Set(
      Array.isArray(parsedValue)
        ? parsedValue.filter((item): item is string => typeof item === "string")
        : [],
    );
  } catch (error) {
    console.error("[pending-damage-bookings] failed to read seen IDs", error);
    return new Set<string>();
  }
}

function writeSeenPendingDamageIds(ids: Set<string>) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    PENDING_DAMAGE_SEEN_STORAGE_KEY,
    JSON.stringify(Array.from(ids)),
  );
}

const PENDING_DAMAGE_SEEN_STORAGE_KEY = "lend:admin:pending-damage:seen-ids";
