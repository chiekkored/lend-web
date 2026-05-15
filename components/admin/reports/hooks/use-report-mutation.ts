"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";

import type { AdminReport, ReportStatus } from "@/lib/admin-reports";
import {
  getFirebaseFirestore,
  hasFirebaseConfig,
  missingFirebaseConfig,
} from "@/lib/firebase";

import { reportQueryKeys } from "../data/report-queries";

export function useReportMutation(report: AdminReport) {
  const queryClient = useQueryClient();
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const resetError = React.useCallback(() => setError(null), []);

  async function updateStatus(status: ReportStatus) {
    setError(null);

    if (!hasFirebaseConfig) {
      setError(
        `Missing Firebase configuration: ${missingFirebaseConfig.join(", ")}.`,
      );
      return false;
    }

    setSubmitting(true);
    try {
      await updateDoc(doc(getFirebaseFirestore(), "reports", report.id), {
        lastUpdated: serverTimestamp(),
        status,
      });
      await queryClient.invalidateQueries({ queryKey: reportQueryKeys.root });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update report.");
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  return {
    error,
    resetError,
    submitting,
    updateStatus,
  };
}
