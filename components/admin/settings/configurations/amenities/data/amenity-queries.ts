"use client";

import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";

import {
  mapAdminAmenity,
  type AdminAmenity,
  type AmenityWriteValues,
} from "@/lib/admin-amenities";
import { getFirebaseAuth, getFirebaseFirestore } from "@/lib/firebase";

export const amenityQueryKeys = {
  all: ["admin", "amenities"] as const,
  list: () => [...amenityQueryKeys.all, "list"] as const,
};

export type AmenityMutationInput = {
  currentId?: string;
  values: AmenityWriteValues;
};

export async function listAdminAmenities() {
  const snapshot = await getDocs(
    query(collection(getFirebaseFirestore(), "amenities"), orderBy("sortOrder")),
  );
  return snapshot.docs.map(mapAdminAmenity);
}

export async function saveAdminAmenity({
  currentId,
  values,
}: AmenityMutationInput) {
  const db = getFirebaseFirestore();
  const adminUid = getFirebaseAuth().currentUser?.uid ?? "admin";
  const nextId = values.id.trim();
  const payload = {
    appliesToDetailSchemaKeys: values.appliesToDetailSchemaKeys,
    group: values.group.trim(),
    iconKey: values.iconKey.trim(),
    isActive: values.isActive,
    label: values.label.trim(),
    sortOrder: values.sortOrder,
    updatedAt: serverTimestamp(),
    updatedBy: adminUid,
  };

  if (currentId && currentId !== nextId) {
    const batch = writeBatch(db);
    batch.set(doc(db, "amenities", nextId), {
      ...payload,
      createdAt: serverTimestamp(),
      createdBy: adminUid,
    });
    batch.update(doc(db, "amenities", currentId), {
      isActive: false,
      updatedAt: serverTimestamp(),
      updatedBy: adminUid,
    });
    await batch.commit();
    return;
  }

  await setDoc(
    doc(db, "amenities", nextId),
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

export async function deactivateAdminAmenity(amenity: AdminAmenity) {
  await updateDoc(doc(getFirebaseFirestore(), "amenities", amenity.id), {
    isActive: false,
    updatedAt: serverTimestamp(),
    updatedBy: getFirebaseAuth().currentUser?.uid ?? "admin",
  });
}

export async function activateAdminAmenity(amenity: AdminAmenity) {
  await updateDoc(doc(getFirebaseFirestore(), "amenities", amenity.id), {
    isActive: true,
    updatedAt: serverTimestamp(),
    updatedBy: getFirebaseAuth().currentUser?.uid ?? "admin",
  });
}
