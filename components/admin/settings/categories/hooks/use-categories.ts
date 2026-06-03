"use client";

import { useQuery } from "@tanstack/react-query";

import { hasFirebaseConfig, missingFirebaseConfig } from "@/lib/firebase";

import {
  categoryQueryKeys,
  listAdminCategories,
} from "../data/category-queries";
import { useCategoryMutations } from "./use-category-mutations";

export function useCategories() {
  const query = useQuery({
    enabled: hasFirebaseConfig,
    queryFn: listAdminCategories,
    queryKey: categoryQueryKeys.list(),
  });
  const data = query.data ?? [];
  const mutations = useCategoryMutations(data);

  return {
    data,
    error: !hasFirebaseConfig
      ? `Missing Firebase configuration: ${missingFirebaseConfig.join(", ")}.`
      : query.error
        ? "Unable to load categories."
        : null,
    loading: hasFirebaseConfig ? query.isLoading : false,
    ...mutations,
  };
}
