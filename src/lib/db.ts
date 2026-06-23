import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs,
  query, 
  orderBy, 
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions
} from 'firebase/firestore';
import { db, auth } from './firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const code = (error as any)?.code || '';
  const message = error instanceof Error ? error.message : String(error);

  // If the error is network/offline related (transient/connection issue), log it and fail safe
  if (
    code === 'unavailable' || 
    message.includes('Could not reach Cloud Firestore backend') ||
    message.includes('unavailable') ||
    message.includes('failed to connect') ||
    message.includes('Connection failed') ||
    message.includes('the client is offline')
  ) {
    console.warn(`[Firestore Safe Fallback] Operation '${operationType}' on path '${path}' experienced a network/disconnect. Currently operating in offline cache mode. Error detail: ${message}`);
    return;
  }

  const errInfo: FirestoreErrorInfo = {
    error: message,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.warn('Firestore Operation Notification: ', errInfo);
  // Do NOT throw to avoid crashing the app in async contexts or iframes
}

// Helper for document conversion
const converter = <T>(): FirestoreDataConverter<T> => ({
  toFirestore: (data: T) => data as DocumentData,
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions) => {
    return { ...snapshot.data(options), id: snapshot.id } as T;
  }
});

/**
 * Generic Listener
 */
export const subscribeToCollection = <T>(
  collectionName: string, 
  callback: (data: T[]) => void, 
  sortField?: string,
  sortOrder: 'asc' | 'desc' = 'asc'
) => {
  const colRef = collection(db, collectionName).withConverter(converter<T>());
  const q = sortField ? query(colRef, orderBy(sortField, sortOrder)) : colRef;
  
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => doc.data());
    callback(data);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, collectionName);
  });
};

export const subscribeToDocument = <T>(
  collectionName: string, 
  docId: string, 
  callback: (data: T | null) => void
) => {
  const docRef = doc(db, collectionName, docId).withConverter(converter<T>());
  return onSnapshot(docRef, (snapshot) => {
    callback(snapshot.exists() ? snapshot.data() : null);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, `${collectionName}/${docId}`);
  });
};

// Helper to remove undefined values before sending to Firestore
const cleanUndefined = (obj: any): any => {
  if (obj && typeof obj === 'object') {
    const cleaned: any = Array.isArray(obj) ? [] : {};
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      if (value !== undefined) {
        cleaned[key] = cleanUndefined(value);
      }
    });
    return cleaned;
  }
  return obj;
};

/**
 * Update Operations
 */
export const upsertDocument = async (collectionName: string, docId: string, data: any) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, cleanUndefined(data), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${docId}`);
  }
};

export const addDocument = async (collectionName: string, data: any) => {
  try {
    const colRef = collection(db, collectionName);
    return await addDoc(colRef, cleanUndefined(data));
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, collectionName);
  }
};

export const updateDocument = async (collectionName: string, docId: string, data: any) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, cleanUndefined(data));
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${collectionName}/${docId}`);
  }
};

export const deleteDocument = async (collectionName: string, docId: string) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${docId}`);
  }
};

export const deleteAllInCollection = async (collectionName: string) => {
  try {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    const promises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(promises);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, collectionName);
  }
};

export const clearCollection = async (collectionName: string, ids: string[]) => {
  const promises = ids.map(id => deleteDocument(collectionName, id));
  await Promise.all(promises);
};
