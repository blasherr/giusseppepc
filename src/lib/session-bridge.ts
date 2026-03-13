import { firestore } from "./firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
  type DocumentData,
} from "firebase/firestore";

export type AdminCommand =
  | { type: "message"; text: string }
  | { type: "screamer"; preset?: string; url?: string }
  | { type: "blackout"; duration?: number }
  | { type: "glitch"; duration?: number }
  | { type: "bsod" }
  | { type: "invert"; duration?: number }
  | { type: "matrix"; duration?: number }
  | { type: "freeze"; duration?: number }
  | { type: "fakeerror"; text?: string }
  | { type: "sound"; sound: "alarm" | "static" | "heartbeat" }
  | { type: "ping" }
  | { type: "gptwo-connect" };

export type UserEvent =
  | { type: "terminal-line"; text: string; timestamp: number }
  | { type: "terminal-clear"; timestamp: number }
  | { type: "pong"; timestamp: number }
  | { type: "heartbeat"; timestamp: number; windowCount: number; session: string };

type Listener = (data: AdminCommand | UserEvent) => void;

class SessionBridge {
  private channel: BroadcastChannel | null = null;
  private listeners: Map<string, Set<Listener>> = new Map();
  private firebaseReady = false;
  private startTime = Date.now();
  private processedIds = new Set<string>();

  constructor() {
    if (typeof window === "undefined") return;

    // BroadcastChannel for same-browser
    try {
      this.channel = new BroadcastChannel("cerberus-os");
      this.channel.onmessage = (e: MessageEvent<{ source: string; data: AdminCommand | UserEvent }>) => {
        const msg = e.data;
        this.dispatch(msg.source, msg.data);
      };
    } catch {
      /* not available */
    }

    // Firestore listeners (only if Firebase is configured)
    if (firestore) {
      this.initFirestore();
    }
  }

  private initFirestore() {
    if (!firestore) return;

    try {
      // Listen admin commands
      const adminCol = collection(firestore, "cerberus-commands");
      const adminQ = query(adminCol, orderBy("createdAt", "asc"));
      onSnapshot(adminQ, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added" && firestore) {
            const d = change.doc.data() as DocumentData;
            const id = change.doc.id;
            if (this.processedIds.has(id)) return;
            this.processedIds.add(id);
            if (d.clientTimestamp && d.clientTimestamp < this.startTime) {
              deleteDoc(doc(firestore, "cerberus-commands", id));
              return;
            }
            if (d.data) {
              this.dispatch("admin", d.data as AdminCommand);
            }
            deleteDoc(doc(firestore, "cerberus-commands", id));
          }
        });
      });

      // Listen user events
      const userCol = collection(firestore, "cerberus-user-events");
      const userQ = query(userCol, orderBy("createdAt", "asc"));
      onSnapshot(userQ, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added" && firestore) {
            const d = change.doc.data() as DocumentData;
            const id = change.doc.id;
            if (this.processedIds.has(id)) return;
            this.processedIds.add(id);
            if (d.clientTimestamp && d.clientTimestamp < this.startTime) {
              deleteDoc(doc(firestore, "cerberus-user-events", id));
              return;
            }
            if (d.data) {
              this.dispatch("user", d.data as UserEvent);
            }
            deleteDoc(doc(firestore, "cerberus-user-events", id));
          }
        });
      });

      this.firebaseReady = true;
    } catch (err) {
      console.warn("[SessionBridge] Firestore init failed, using BroadcastChannel only", err);
    }
  }

  private dispatch(source: string, data: AdminCommand | UserEvent) {
    const key = `${source}:${data.type}`;
    this.listeners.get(key)?.forEach((fn) => fn(data));
    this.listeners.get(`${source}:*`)?.forEach((fn) => fn(data));
  }

  on(event: string, callback: Listener) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: Listener) {
    this.listeners.get(event)?.delete(callback);
  }

  sendAsAdmin(data: AdminCommand) {
    // Local broadcast
    this.channel?.postMessage({ source: "admin", data });
    // Firestore
    if (this.firebaseReady && firestore) {
      addDoc(collection(firestore, "cerberus-commands"), {
        data,
        clientTimestamp: Date.now(),
        createdAt: serverTimestamp(),
      });
    }
  }

  sendAsUser(data: UserEvent) {
    // Local broadcast
    this.channel?.postMessage({ source: "user", data });
    // Firestore
    if (this.firebaseReady && firestore) {
      addDoc(collection(firestore, "cerberus-user-events"), {
        data,
        clientTimestamp: Date.now(),
        createdAt: serverTimestamp(),
      });
    }
  }
}

export const bridge = new SessionBridge();
