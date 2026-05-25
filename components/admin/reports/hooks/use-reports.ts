"use client";

import {
  filterReportsBySection,
  reportSectionContent,
  type AdminReportSection,
} from "@/lib/admin-reports";

import { useLiveReports } from "./use-live-reports";

export function useReports(section: AdminReportSection) {
  const liveReports = useLiveReports();
  return {
    content: reportSectionContent[section],
    data: filterReportsBySection(liveReports.data, section),
    error: liveReports.error,
    loading: liveReports.loading,
    pagination: liveReports.pagination,
  };
}
