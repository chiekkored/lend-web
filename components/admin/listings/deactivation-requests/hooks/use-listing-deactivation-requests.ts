"use client";

import * as React from "react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";

import type { AdminDataTablePaginationProps } from "@/components/admin/admin-data-table";
import type {
  AdminCursor,
  AdminCursorPage,
} from "@/lib/helpers/use-admin-cursor-pagination";

import {
  fetchListingDeactivationRequestsPage,
  listingDeactivationRequestQueryKeys,
  listenListingDeactivationRequestsPage,
  type ListingDeactivationRequest,
  type ListingDeactivationRequestStatusFilter,
} from "../data/deactivation-request-queries";

const defaultPageSize = 50;
const pageSizeOptions = [10, 20, 50] as const;

export function useListingDeactivationRequests() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] =
    React.useState<ListingDeactivationRequestStatusFilter>("Pending");
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(defaultPageSize);
  const [pageStartCursors, setPageStartCursors] = React.useState<AdminCursor[]>([
    null,
  ]);
  const [liveLoading, setLiveLoading] = React.useState(true);
  const [liveError, setLiveError] = React.useState<string | null>(null);
  const cursor = pageStartCursors[pageIndex] ?? null;
  const pageQueryKey = listingDeactivationRequestQueryKeys.page({
    pageIndex,
    pageSize,
    statusFilter,
  });

  const query = useQuery({
    enabled: pageIndex > 0,
    placeholderData: keepPreviousData,
    queryFn: () =>
      fetchListingDeactivationRequestsPage({
        cursor,
        pageSize,
        statusFilter,
      }),
    queryKey: pageQueryKey,
    staleTime: 60_000,
  });

  React.useEffect(() => {
    if (pageIndex !== 0) {
      setLiveLoading(false);
      return;
    }

    setLiveLoading(true);
    setLiveError(null);

    const firstPageQueryKey = listingDeactivationRequestQueryKeys.page({
      pageIndex: 0,
      pageSize,
      statusFilter,
    });

    return listenListingDeactivationRequestsPage({
      pageSize,
      statusFilter,
      onError: (nextError) => {
        console.error("[listing-deactivation] live page failed", nextError);
        setLiveError("Unable to load deactivation requests.");
        setLiveLoading(false);
      },
      onNext: (page) => {
        queryClient.setQueryData<AdminCursorPage<ListingDeactivationRequest>>(
          firstPageQueryKey,
          page,
        );
        setLiveError(null);
        setLiveLoading(false);
      },
    });
  }, [pageIndex, pageSize, queryClient, statusFilter]);

  const resetPagination = React.useCallback(() => {
    setPageIndex(0);
    setPageStartCursors([null]);
  }, []);

  const onStatusFilterChange = React.useCallback(
    (nextStatusFilter: ListingDeactivationRequestStatusFilter) => {
      resetPagination();
      setStatusFilter(nextStatusFilter);
    },
    [resetPagination],
  );

  const page = query.data;
  const canNextPage = Boolean(page?.hasMore && page.lastCursor);

  const onNextPage = React.useCallback(() => {
    if (!page?.hasMore || !page.lastCursor) return;
    const nextPageIndex = pageIndex + 1;
    setPageStartCursors((current) => {
      const next = current.slice(0, nextPageIndex + 1);
      next[nextPageIndex] = page.lastCursor;
      return next;
    });
    setPageIndex(nextPageIndex);
  }, [page?.hasMore, page?.lastCursor, pageIndex]);

  const onPreviousPage = React.useCallback(() => {
    if (pageIndex === 0) return;
    setPageIndex((current) => Math.max(current - 1, 0));
  }, [pageIndex]);

  const onPageSizeChange = React.useCallback((nextPageSize: number) => {
    resetPagination();
    setPageSize(nextPageSize);
  }, [resetPagination]);

  const pagination = React.useMemo<AdminDataTablePaginationProps>(
    () => ({
      canNextPage,
      canPreviousPage: pageIndex > 0,
      mode: "server",
      onNextPage,
      onPageSizeChange,
      onPreviousPage,
      pageLabel: `Page ${pageIndex + 1}`,
      pageSize,
      pageSizeOptions: [...pageSizeOptions],
      paginationLoading: pageIndex === 0 ? liveLoading : query.isFetching,
      recordCountLabel: `Showing ${page?.items.length ?? 0} records`,
    }),
    [
      canNextPage,
      liveLoading,
      onNextPage,
      onPageSizeChange,
      onPreviousPage,
      page?.items.length,
      pageIndex,
      pageSize,
      query.isFetching,
    ],
  );
  const error =
    liveError ??
    (query.error instanceof Error
      ? query.error.message
      : query.error
        ? "Unable to load deactivation requests."
        : null);

  return {
    data: page?.items ?? [],
    error,
    loading: pageIndex === 0 ? liveLoading && !page : query.isLoading,
    pagination,
    setStatusFilter: onStatusFilterChange,
    statusFilter,
  };
}
