"use client";

import * as React from "react";
import { ChevronDown, ChevronRight, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCategoryDate, type AdminCategory } from "@/lib/admin-categories";
import { cn } from "@/lib/utils";

import { CategoryRowActions } from "./category-row-actions";

type CategoryStatusFilter = "all" | "active" | "inactive";

type CategoryTableProps = {
  actions?: React.ReactNode;
  canDeleteCategories: boolean;
  data: AdminCategory[];
  error?: string | null;
  loading?: boolean;
  onActivate: (category: AdminCategory) => void;
  onDeactivate: (category: AdminCategory) => void;
  onDelete: (category: AdminCategory) => void;
  onEdit: (category: AdminCategory) => void;
};

export function CategoryTable({
  actions,
  canDeleteCategories,
  data,
  error,
  loading,
  onActivate,
  onDeactivate,
  onDelete,
  onEdit,
}: CategoryTableProps) {
  const [statusFilter, setStatusFilter] =
    React.useState<CategoryStatusFilter>("all");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [expandedGroups, setExpandedGroups] = React.useState<
    Record<string, boolean>
  >({});
  const groups = React.useMemo(
    () => buildCategoryGroups(data, statusFilter, searchTerm),
    [data, statusFilter, searchTerm],
  );
  const visibleRecordCount = groups.reduce(
    (count, group) => count + 1 + group.children.length,
    0,
  );

  function isGroupExpanded(groupId: string) {
    return expandedGroups[groupId] ?? true;
  }

  function toggleGroup(groupId: string) {
    setExpandedGroups((current) => ({
      ...current,
      [groupId]: !(current[groupId] ?? true),
    }));
  }

  return (
    <div className="min-w-0 w-full max-w-full space-y-4">
      <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative w-full min-w-0 sm:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search categories"
              value={searchTerm}
            />
          </div>
          <Select
            onValueChange={(value) =>
              setStatusFilter(value as CategoryStatusFilter)
            }
            value={statusFilter}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex min-w-0 flex-wrap gap-2">{actions}</div>
      </div>

      <div className="min-w-0 w-full max-w-full">
        <div className="min-w-0 w-full max-w-full overflow-x-auto rounded-md border">
          <Table className="w-max min-w-full" wrapperClassName="overflow-visible">
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Icon</TableHead>
                <TableHead>Sort Order</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    className="h-24 text-center text-muted-foreground"
                    colSpan={8}
                  >
                    Loading categories...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell
                    className="h-24 text-center text-destructive"
                    colSpan={8}
                  >
                    {error}
                  </TableCell>
                </TableRow>
              ) : groups.length ? (
                groups.map((group) => {
                  const expanded = isGroupExpanded(group.id);
                  return (
                    <React.Fragment key={group.id}>
                      <CategoryDisplayRow
                        canDeleteCategories={canDeleteCategories}
                        category={group.parent}
                        childCount={group.children.length}
                        expanded={expanded}
                        isSyntheticGroup={group.synthetic}
                        onActivate={onActivate}
                        onDeactivate={onDeactivate}
                        onDelete={onDelete}
                        onEdit={onEdit}
                        onToggle={() => toggleGroup(group.id)}
                      />
                      {expanded
                        ? group.children.map((category) => (
                            <CategoryDisplayRow
                              canDeleteCategories={canDeleteCategories}
                              category={category}
                              isChild
                              key={category.id}
                              onActivate={onActivate}
                              onDeactivate={onDeactivate}
                              onDelete={onDelete}
                              onEdit={onEdit}
                            />
                          ))
                        : null}
                    </React.Fragment>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    className="h-24 text-center text-muted-foreground"
                    colSpan={8}
                  >
                    No categories found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          Showing {visibleRecordCount} of {data.length} records
        </div>
      </div>
    </div>
  );
}

type CategoryGroup = {
  id: string;
  parent: AdminCategory;
  children: AdminCategory[];
  synthetic: boolean;
};

function CategoryDisplayRow({
  canDeleteCategories,
  category,
  childCount,
  expanded,
  isChild = false,
  isSyntheticGroup = false,
  onActivate,
  onDeactivate,
  onDelete,
  onEdit,
  onToggle,
}: {
  canDeleteCategories: boolean;
  category: AdminCategory;
  childCount?: number;
  expanded?: boolean;
  isChild?: boolean;
  isSyntheticGroup?: boolean;
  onActivate: (category: AdminCategory) => void;
  onDeactivate: (category: AdminCategory) => void;
  onDelete: (category: AdminCategory) => void;
  onEdit: (category: AdminCategory) => void;
  onToggle?: () => void;
}) {
  const canToggle = onToggle && (childCount ?? 0) > 0;

  return (
    <TableRow className={cn(!isChild && "bg-muted/25")}>
      <TableCell>
        <div className={cn("flex min-w-64 items-center gap-2", isChild && "pl-8")}>
          {!isChild ? (
            <Button
              aria-label={expanded ? "Collapse category group" : "Expand category group"}
              className={cn("size-8 shrink-0", !canToggle && "invisible")}
              disabled={!canToggle}
              onClick={onToggle}
              size="icon"
              type="button"
              variant="ghost"
            >
              {expanded ? <ChevronDown /> : <ChevronRight />}
            </Button>
          ) : (
            <span className="h-px w-8 shrink-0 bg-border" />
          )}
          <div className="min-w-0">
            <div className={cn("font-medium", isSyntheticGroup && "text-muted-foreground")}>
              {category.name}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>{category.id}</span>
              {!isChild && childCount !== undefined ? (
                <Badge variant="outline">
                  {childCount} {childCount === 1 ? "child" : "children"}
                </Badge>
              ) : null}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell>{category.slug || "Not set"}</TableCell>
      <TableCell>{category.iconKey || "default"}</TableCell>
      <TableCell>{isSyntheticGroup ? "N/A" : category.sortOrder}</TableCell>
      <TableCell>
        {isSyntheticGroup ? (
          "N/A"
        ) : category.isFeatured ? (
          <Badge>Featured</Badge>
        ) : (
          "No"
        )}
      </TableCell>
      <TableCell>
        {isSyntheticGroup ? (
          "N/A"
        ) : category.isActive ? (
          <Badge variant="secondary">Active</Badge>
        ) : (
          <Badge variant="outline">Inactive</Badge>
        )}
      </TableCell>
      <TableCell>
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {isSyntheticGroup ? "N/A" : formatCategoryDate(category.updatedAt)}
        </span>
      </TableCell>
      <TableCell>
        {isSyntheticGroup ? null : (
          <CategoryRowActions
            canDeleteCategories={canDeleteCategories}
            category={category}
            onActivate={onActivate}
            onDeactivate={onDeactivate}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        )}
      </TableCell>
    </TableRow>
  );
}

function buildCategoryGroups(
  categories: AdminCategory[],
  statusFilter: CategoryStatusFilter,
  searchTerm: string,
): CategoryGroup[] {
  const sortedCategories = [...categories].sort(compareCategories);
  const parentCategories = sortedCategories.filter((category) => !category.parentId);
  const parentIds = new Set(parentCategories.map((category) => category.id));
  const childrenByParent = new Map<string, AdminCategory[]>();
  const orphanChildren: AdminCategory[] = [];

  for (const category of sortedCategories) {
    if (!category.parentId) continue;
    if (!parentIds.has(category.parentId)) {
      orphanChildren.push(category);
      continue;
    }
    const children = childrenByParent.get(category.parentId) ?? [];
    children.push(category);
    childrenByParent.set(category.parentId, children);
  }

  const groups = parentCategories
    .map((parent) =>
      buildGroup({
        children: childrenByParent.get(parent.id) ?? [],
        parent,
        searchTerm,
        statusFilter,
        synthetic: false,
      }),
    )
    .filter((group): group is CategoryGroup => Boolean(group));

  const orphanGroup = buildGroup({
    children: orphanChildren,
    parent: unassignedCategoryGroup,
    searchTerm,
    statusFilter,
    synthetic: true,
  });

  return orphanGroup ? [...groups, orphanGroup] : groups;
}

function buildGroup({
  children,
  parent,
  searchTerm,
  statusFilter,
  synthetic,
}: {
  children: AdminCategory[];
  parent: AdminCategory;
  searchTerm: string;
  statusFilter: CategoryStatusFilter;
  synthetic: boolean;
}) {
  const normalizedSearch = normalizeSearch(searchTerm);
  const parentMatches =
    synthetic || categoryMatches(parent, statusFilter, normalizedSearch);
  const matchingChildren = children.filter((category) =>
    categoryMatches(category, statusFilter, normalizedSearch),
  );

  if (!parentMatches && matchingChildren.length === 0) return null;

  return {
    children: matchingChildren,
    id: parent.id,
    parent,
    synthetic,
  };
}

function categoryMatches(
  category: AdminCategory,
  statusFilter: CategoryStatusFilter,
  normalizedSearch: string,
) {
  if (statusFilter === "active" && !category.isActive) return false;
  if (statusFilter === "inactive" && category.isActive) return false;
  if (!normalizedSearch) return true;
  return getCategorySearchText(category).includes(normalizedSearch);
}

function getCategorySearchText(category: AdminCategory) {
  return normalizeSearch(
    [
      category.id,
      category.name,
      category.slug,
      category.iconKey,
      category.listingKind,
      category.detailSchemaKey,
      category.parentId,
      category.isActive ? "active" : "inactive",
      category.isFeatured ? "featured" : "",
    ]
      .filter(Boolean)
      .join(" "),
  );
}

function normalizeSearch(value: string) {
  return value.trim().toLowerCase();
}

function compareCategories(left: AdminCategory, right: AdminCategory) {
  if (left.sortOrder !== right.sortOrder) {
    return left.sortOrder - right.sortOrder;
  }
  return left.name.localeCompare(right.name);
}

const unassignedCategoryGroup: AdminCategory = {
  createdAt: null,
  detailSchemaKey: "",
  iconKey: "",
  id: "__unassigned__",
  imageUrl: null,
  isActive: true,
  isFeatured: false,
  level: 1,
  listingKind: "",
  name: "Unassigned subcategories",
  parentId: null,
  slug: "",
  sortOrder: Number.MAX_SAFE_INTEGER,
  updatedAt: null,
};
