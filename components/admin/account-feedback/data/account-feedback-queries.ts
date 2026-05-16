import { collection, getDocs, orderBy, query } from "firebase/firestore";

import {
  mapAccountFeedback,
  type AccountFeedback,
} from "@/lib/admin-account-feedback";
import {
  getFirebaseFirestore,
  hasFirebaseConfig,
  missingFirebaseConfig,
} from "@/lib/firebase";

export const accountFeedbackQueryKeys = {
  root: ["admin", "accountFeedback"] as const,
};

export async function fetchAccountFeedback(): Promise<AccountFeedback[]> {
  if (!hasFirebaseConfig) {
    throw new Error(
      `Missing Firebase configuration: ${missingFirebaseConfig.join(", ")}.`,
    );
  }

  const snapshot = await getDocs(
    query(
      collection(getFirebaseFirestore(), "accountFeedback"),
      orderBy("createdAt", "desc"),
    ),
  );

  return snapshot.docs.map(mapAccountFeedback);
}
