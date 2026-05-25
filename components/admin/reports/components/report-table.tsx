"use client";

import {
  AdminDataTable,
  type AdminDataTablePaginationProps,
} from "@/components/admin/admin-data-table";
import type { AdminReport } from "@/lib/admin-reports";

import { useReportColumns } from "./report-columns";

type ReportTableProps = {
  data: AdminReport[];
  error: string | null;
  loading: boolean;
  pagination?: AdminDataTablePaginationProps;
};

export function ReportTable({ data, error, loading, pagination }: ReportTableProps) {
  const columns = useReportColumns();

  return (
    <AdminDataTable
      columns={columns}
      data={data}
      emptyMessage="No reports match this view."
      error={error}
      loading={loading}
      pagination={pagination}
      primaryColumnId="report"
      searchPlaceholder="Search reports"
      storageKey="admin:reports:column-visibility"
    />
  );
}
