// File: apps/nexusmapping-admin/src/lib/stores/navigation.ts
import { writable } from 'svelte/store';

// This store will hold the state of our mobile navigation drawer.
// `true` means it's open, `false` means it's closed.
export const isMobileMenuOpen = writable(false);