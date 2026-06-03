"use client";

import {
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

import {
  mapAdminCategory,
  seedAdminCategories,
  type AdminCategory,
  type CategoryWriteValues,
} from "@/lib/admin-categories";
import { getFirebaseAuth, getFirebaseFirestore } from "@/lib/firebase";

export const categoryQueryKeys = {
  all: ["admin", "categories"] as const,
  list: () => [...categoryQueryKeys.all, "list"] as const,
};

export type CategoryMutationInput = {
  currentId?: string;
  values: CategoryWriteValues;
};

export async function listAdminCategories() {
  const snapshot = await getDocs(
    query(collection(getFirebaseFirestore(), "categories"), orderBy("sortOrder")),
  );
  return snapshot.docs.map(mapAdminCategory);
}

export async function saveAdminCategory({
  currentId,
  values,
}: CategoryMutationInput) {
  const db = getFirebaseFirestore();
  const user = getFirebaseAuth().currentUser;
  const adminUid = user?.uid ?? "admin";
  const parentId = values.parentId?.trim() || null;
  const level = parentId ? 2 : 1;
  const nextId = values.slug;
  const payload = {
    iconKey: values.iconKey.trim(),
    imageUrl: values.imageUrl?.trim() || null,
    isActive: values.isActive,
    isFeatured: values.isFeatured,
    level,
    name: values.name.trim(),
    parentId,
    slug: values.slug.trim(),
    sortOrder: values.sortOrder,
    updatedAt: serverTimestamp(),
    updatedBy: adminUid,
  };

  if (currentId && currentId !== nextId) {
    const batch = writeBatch(db);
    batch.set(doc(db, "categories", nextId), {
      ...payload,
      createdAt: serverTimestamp(),
      createdBy: adminUid,
    });
    batch.update(doc(db, "categories", currentId), {
      isActive: false,
      updatedAt: serverTimestamp(),
      updatedBy: adminUid,
    });
    await batch.commit();
    return;
  }

  await setDoc(
    doc(db, "categories", nextId),
    currentId
      ? payload
      : {
          ...payload,
          createdAt: serverTimestamp(),
          createdBy: adminUid,
        },
    { merge: true },
  );
}

export async function deactivateAdminCategory(category: AdminCategory) {
  await updateDoc(doc(getFirebaseFirestore(), "categories", category.id), {
    isActive: false,
    updatedAt: serverTimestamp(),
    updatedBy: getFirebaseAuth().currentUser?.uid ?? "admin",
  });
}

export async function activateAdminCategory(category: AdminCategory) {
  await updateDoc(doc(getFirebaseFirestore(), "categories", category.id), {
    isActive: true,
    updatedAt: serverTimestamp(),
    updatedBy: getFirebaseAuth().currentUser?.uid ?? "admin",
  });
}

export async function deleteAdminCategory(category: AdminCategory) {
  await deleteDoc(doc(getFirebaseFirestore(), "categories", category.id));
}

export async function countListingsForCategory(categoryId: string) {
  const snapshot = await getCountFromServer(
    query(
      collection(getFirebaseFirestore(), "assets"),
      where("categoryId", "==", categoryId),
      where("isDeleted", "==", false),
      limit(1),
    ),
  );
  return snapshot.data().count;
}

export async function seedInitialCategories() {
  const db = getFirebaseFirestore();
  const batch = writeBatch(db);
  const uid = getFirebaseAuth().currentUser?.uid ?? "admin";
  for (const category of seedAdminCategories) {
    batch.set(
      doc(db, "categories", category.slug),
      {
        ...category,
        createdAt: serverTimestamp(),
        createdBy: uid,
        level: 1,
        updatedAt: serverTimestamp(),
        updatedBy: uid,
      },
      { merge: true },
    );
  }
  await batch.commit();
}
