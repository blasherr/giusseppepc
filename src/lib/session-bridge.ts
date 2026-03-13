import { getFirestoreInstance } from "./firebase";

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
        var msg = e.data;
        this.dispatch(msg.source, msg.data);
      };
    } catch (e) {
      /* not available */
    }

    // Firestore listeners (loaded async to avoid crash)
    this.initFirestore();
  }

  private async initFirestore() {
    try {
      var fs = await getFirestoreInstance();
      if (!fs) return;

      var { collection, onSnapshot, deleteDoc, doc, query, orderBy } = await import("firebase/firestore");

      // Listen admin commands
      var adminCol = collection(fs, "cerberus-commands");
      var adminQ = query(adminCol, orderBy("createdAt", "asc"));
      onSnapshot(adminQ, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added" && fs) {
            var d = change.doc.data();
            var id = change.doc.id;
            if (this.processedIds.has(id)) return;
            this.processedIds.add(id);
            if (d.clientTimestamp && d.clientTimestamp < this.startTime) {
              deleteDoc(doc(fs, "cerberus-commands", id));
              return;
            }
            if (d.data) {
              this.dispatch("admin", d.data as AdminCommand);
            }
            deleteDoc(doc(fs, "cerberus-commands", id));
          }
        });
      });

      // Listen user events
      var userCol = collection(fs, "cerberus-user-events");
      var userQ = query(userCol, orderBy("createdAt", "asc"));
      onSnapshot(userQ, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added" && fs) {
            var d = change.doc.data();
            var id = change.doc.id;
            if (this.processedIds.has(id)) return;
            this.processedIds.add(id);
            if (d.clientTimestamp && d.clientTimestamp < this.startTime) {
              deleteDoc(doc(fs, "cerberus-user-events", id));
              return;
            }
            if (d.data) {
              this.dispatch("user", d.data as UserEvent);
            }
            deleteDoc(doc(fs, "cerberus-user-events", id));
          }
        });
      });

      this.firebaseReady = true;
    } catch (err) {
      console.warn("[SessionBridge] Firestore init failed, using BroadcastChannel only", err);
    }
  }

  private dispatch(source: string, data: AdminCommand | UserEvent) {
    var key = source + ":" + data.type;
    var wildcard = source + ":*";
    var listeners = this.listeners.get(key);
    if (listeners) listeners.forEach(function(fn) { fn(data); });
    var wcListeners = this.listeners.get(wildcard);
    if (wcListeners) wcListeners.forEach(function(fn) { fn(data); });
  }

  on(event: string, callback: Listener) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: Listener) {
    var s = this.listeners.get(event);
    if (s) s.delete(callback);
  }

  async sendAsAdmin(data: AdminCommand) {
    // Local broadcast
    if (this.channel) {
      this.channel.postMessage({ source: "admin", data: data });
    }
    // Firestore
    if (this.firebaseReady) {
      try {
        var fs = await getFirestoreInstance();
        if (!fs) return;
        var { collection, addDoc, serverTimestamp } = await import("firebase/firestore");
        addDoc(collection(fs, "cerberus-commands"), {
          data: data,
          clientTimestamp: Date.now(),
          createdAt: serverTimestamp(),
        });
      } catch (e) {
        /* firebase unavailable */
      }
    }
  }

  async sendAsUser(data: UserEvent) {
    // Local broadcast
    if (this.channel) {
      this.channel.postMessage({ source: "user", data: data });
    }
    // Firestore
    if (this.firebaseReady) {
      try {
        var fs = await getFirestoreInstance();
        if (!fs) return;
        var { collection, addDoc, serverTimestamp } = await import("firebase/firestore");
        addDoc(collection(fs, "cerberus-user-events"), {
          data: data,
          clientTimestamp: Date.now(),
          createdAt: serverTimestamp(),
        });
      } catch (e) {
        /* firebase unavailable */
      }
    }
  }
}

export const bridge = new SessionBridge();
