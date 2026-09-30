"use client";

import { useSyncExternalStore } from "react";
import type { Paper } from "./types";

/**
 * The reader's personal shelf. Kept in localStorage as a per-reader
 * convenience; every read and write tolerates storage being unavailable.
 */
const KEY = "paraphernalia-shelf-v1";
const listeners = new Set<() => void>();
let cache: Paper[] | null = null;
const EMPTY: Paper[] = [];

function read(): Paper[] {
  if (cache) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(KEY) || "[]") as Paper[];
  } catch {
    cache = [];
  }
  return cache;
}

function write(next: Paper[]) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      l();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
}

export function useShelf(): Paper[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function toggleShelf(p: Paper) {
  const list = read();
  write(list.some((x) => x.url === p.url) ? list.filter((x) => x.url !== p.url) : [{ ...p, figure: null }, ...list]);
}

export function removeFromShelf(url: string) {
  write(read().filter((x) => x.url !== url));
}

export function clearShelf() {
  write([]);
}
