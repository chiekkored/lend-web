"use client";

import { useQuery } from "@tanstack/react-query";

import {
  categoryQueryKeys,
  listAdminCategories,
} from "@/components/admin/settings/categories/data/category-queries";

import { amenityQueryKeys, listAdminAmenities } from "../data/amenity-queries";
import { useAmenityMutations } from "./use-amenity-mutations";

export function useAmenities() {
  const amenitiesQuery = useQuery({
    queryKey: amenityQueryKeys.list(),
    queryFn: listAdminAmenities,
  });
  const categoriesQuery = useQuery({
    queryKey: categoryQueryKeys.list(),
    queryFn: listAdminCategories,
  });
  const data = amenitiesQuery.data ?? [];
  const mutations = useAmenityMutations(data);

  return {
    ...mutations,
    categories: categoriesQuery.data ?? [],
    data,
    error: amenitiesQuery.isError ? "Unable to load amenities." : null,
    loading: amenitiesQuery.isLoading,
    schemaLoading: categoriesQuery.isLoading,
  };
}
