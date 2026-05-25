import {
  collection,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  startAfter,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";

import {
  mapAccountFeedback,
  type AccountFeedback,
} from "@/lib/admin-account-feedback";
import {
  getFirebaseFirestore,
  hasFirebaseConfig,
  missingFirebaseConfig,
} from "@/lib/firebase";
import type { AdminCursor, AdminCursorPage } from "@/lib/helpers/use-admin-cursor-pagination";

export const accountFeedbackQueryKeys = {
  root: ["admin", "accountFeedback"] as const,
  live: ["admin", "accountFeedback", "live"] as const,
};

export const ACCOUNT_FEEDBACK_LIVE_LIMIT = 50;

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

export async function fetchAccountFeedbackPage({
  cursor,
  pageSize,
}: {
  cursor: AdminCursor;
  pageSize: number;
}): Promise<AdminCursorPage<AccountFeedback>> {
  if (!hasFirebaseConfig) {
    throw new Error(
      `Missing Firebase configuration: ${missingFirebaseConfig.join(", ")}.`,
    );
  }

  const feedbackQuery = cursor
    ? query(
        collection(getFirebaseFirestore(), "accountFeedback"),
        orderBy("createdAt", "desc"),
        startAfter(cursor),
        limit(pageSize),
      )
    : query(
        collection(getFirebaseFirestore(), "accountFeedback"),
        orderBy("createdAt", "desc"),
        limit(pageSize),
      );
  const snapshot = await getDocs(feedbackQuery);

  return mapAccountFeedbackPage(snapshot.docs, pageSize);
}

export function listenAccountFeedback({
  onError,
  onNext,
  pageSize = ACCOUNT_FEEDBACK_LIVE_LIMIT,
}: {
  onError: (error: Error) => void;
  onNext: (page: AdminCursorPage<AccountFeedback>) => void;
  pageSize?: number;
}) {
  if (!hasFirebaseConfig) {
    onError(
      new Error(
        `Missing Firebase configuration: ${missingFirebaseConfig.join(", ")}.`,
      ),
    );
    return () => {};
  }

  return onSnapshot(
    query(
      collection(getFirebaseFirestore(), "accountFeedback"),
      orderBy("createdAt", "desc"),
      limit(pageSize),
    ),
    (snapshot) => onNext(mapAccountFeedbackPage(snapshot.docs, pageSize)),
    onError,
  );
}

function mapAccountFeedbackPage(
  docs: QueryDocumentSnapshot<DocumentData>[],
  pageSize: number,
): AdminCursorPage<AccountFeedback> {
  return {
    hasMore: docs.length === pageSize,
    items: docs.map(mapAccountFeedback),
    lastCursor: docs.at(-1) ?? null,
  };
}
