"use client";

import { AdminDataTable } from "@/components/admin/admin-data-table";
import type { AdminReport } from "@/lib/admin-reports";

import { useReportColumns } from "./report-columns";

type ReportTableProps = {
  data: AdminReport[];
  error: string | null;
  loading: boolean;
};

export function ReportTable({ data, error, loading }: ReportTableProps) {
  const columns = useReportColumns();

  return (
    <AdminDataTable
      columns={columns}
      data={data}
      emptyMessage="No reports match this view."
      error={error}
      loading={loading}
      primaryColumnId="report"
      searchPlaceholder="Search reports"
      storageKey="admin:reports:column-visibility"
    />
  );
}
