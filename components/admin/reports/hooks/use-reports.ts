"use client";

import { useQuery } from "@tanstack/react-query";

import {
  filterReportsBySection,
  reportSectionContent,
  type AdminReportSection,
} from "@/lib/admin-reports";

import { fetchAdminReports, reportQueryKeys } from "../data/report-queries";

export function useReports(section: AdminReportSection) {
  const reportsQuery = useQuery({
    queryFn: fetchAdminReports,
    queryKey: reportQueryKeys.root,
  });

  return {
    content: reportSectionContent[section],
    data: filterReportsBySection(reportsQuery.data ?? [], section),
    error:
      reportsQuery.error instanceof Error
        ? reportsQuery.error.message
        : reportsQuery.error
          ? "Unable to load reports."
          : null,
    loading: reportsQuery.isLoading,
  };
}
