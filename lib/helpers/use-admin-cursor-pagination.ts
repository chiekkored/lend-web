"use client";

import * as React from "react";
import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

import type { AdminDataTablePaginationProps } from "@/components/admin/admin-data-table";

export type AdminCursor = QueryDocumentSnapshot<DocumentData> | null;

export type AdminCursorPage<TData> = {
  hasMore: boolean;
  items: TData[];
  lastCursor: AdminCursor;
};

type AdminCursorPageInput = {
  cursor: AdminCursor;
  pageSize: number;
};

type UseAdminCursorPaginationOptions<TData> = {
  enabled?: boolean;
  fetchPage: (input: AdminCursorPageInput) => Promise<AdminCursorPage<TData>>;
  listenFirstPage?: (input: {
    onError: (error: Error) => void;
    onNext: (page: AdminCursorPage<TData>) => void;
    pageSize: number;
  }) => () => void;
  pageSize?: number;
};

const DEFAULT_PAGE_SIZE = 50;
const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

export function useAdminCursorPagination<TData>({
  enabled = true,
  fetchPage,
  listenFirstPage,
  pageSize: initialPageSize = DEFAULT_PAGE_SIZE,
}: UseAdminCursorPaginationOptions<TData>) {
  const [data, setData] = React.useState<TData[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(enabled);
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(initialPageSize);
  const [pageStartCursors, setPageStartCursors] = React.useState<AdminCursor[]>([null]);
  const [lastCursor, setLastCursor] = React.useState<AdminCursor>(null);
  const [hasMore, setHasMore] = React.useState(false);

  const loadPage = React.useCallback(
    async (nextPageIndex: number, cursor: AdminCursor) => {
      setLoading(true);
      setError(null);

      try {
        const page = await fetchPage({ cursor, pageSize });
        setData(page.items);
        setLastCursor(page.lastCursor);
        setHasMore(page.hasMore);
        setPageIndex(nextPageIndex);
      } catch (nextError) {
        console.error("[admin-pagination] failed to load page", nextError);
        setError("Unable to load records.");
      } finally {
        setLoading(false);
      }
    },
    [fetchPage, pageSize],
  );

  React.useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    setData([]);
    setError(null);
    setLoading(true);
    setPageIndex(0);
    setPageStartCursors([null]);
    setLastCursor(null);
    setHasMore(false);

    if (listenFirstPage) {
      return listenFirstPage({
        pageSize,
        onError: (nextError) => {
          console.error("[admin-pagination] live page failed", nextError);
          setError("Unable to load records.");
          setLoading(false);
        },
        onNext: (page) => {
          setData(page.items);
          setLastCursor(page.lastCursor);
          setHasMore(page.hasMore);
          setLoading(false);
        },
      });
    }

    void loadPage(0, null);
  }, [enabled, listenFirstPage, loadPage, pageSize]);

  const onNextPage = React.useCallback(() => {
    if (!hasMore || !lastCursor) {
      return;
    }

    const nextPageIndex = pageIndex + 1;
    setPageStartCursors((current) => {
      const next = current.slice(0, nextPageIndex + 1);
      next[nextPageIndex] = lastCursor;
      return next;
    });
    void loadPage(nextPageIndex, lastCursor);
  }, [hasMore, lastCursor, loadPage, pageIndex]);

  const onPreviousPage = React.useCallback(() => {
    if (pageIndex === 0) {
      return;
    }

    const previousPageIndex = pageIndex - 1;
    const previousCursor = pageStartCursors[previousPageIndex] ?? null;
    void loadPage(previousPageIndex, previousCursor);
  }, [loadPage, pageIndex, pageStartCursors]);

  const onPageSizeChange = React.useCallback((nextPageSize: number) => {
    setPageSize(nextPageSize);
  }, []);

  const pagination = React.useMemo<AdminDataTablePaginationProps>(
    () => ({
      canNextPage: hasMore,
      canPreviousPage: pageIndex > 0,
      mode: "server",
      onNextPage,
      onPageSizeChange,
      onPreviousPage,
      pageLabel: `Page ${pageIndex + 1}`,
      pageSize,
      pageSizeOptions: [...PAGE_SIZE_OPTIONS],
      paginationLoading: loading,
      recordCountLabel: `Showing ${data.length} records`,
    }),
    [data.length, hasMore, loading, onNextPage, onPageSizeChange, onPreviousPage, pageIndex, pageSize],
  );

  return {
    data,
    error,
    loading,
    pageIndex,
    pageSize,
    pagination,
  };
}
