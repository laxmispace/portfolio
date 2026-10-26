import { useCallback, useEffect, useState } from "react";

/** "Breathing app for anxiety" -> "breathing-app-for-anxiety" */
export const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** The site's base path ("/portfolio/" when deployed, see vite.config.ts `base`). */
export const BASE_URL = import.meta.env.BASE_URL;

interface RoutedSelectionOptions<T> {
  items: T[];
  slugOf: (item: T) => string;
  /** history.state key this selection owns, so two drawers never react to each other's entries. */
  stateKey: string;
  /** The URL an open item lives at. */
  urlFor: (slug: string) => string;
  /** Where the page is when nothing is open. */
  closedUrl: () => string;
  /** The slug in the current location, if the visitor landed straight on an item. */
  slugFromLocation: () => string | null;
}

/**
 * A drawer selection with real page semantics, like the case study and blog drawers:
 * opening pushes the item's URL (so back closes it), landing on that URL opens it, and
 * back/forward keep the drawer in sync.
 */
export function useRoutedSelection<T>({ items, slugOf, stateKey, urlFor, closedUrl, slugFromLocation }: RoutedSelectionOptions<T>) {
  const [selected, setSelected] = useState<T | null>(null);
  const find = (slug: unknown) => (typeof slug === "string" ? items.find((i) => slugOf(i) === slug) ?? null : null);

  const open = useCallback((item: T) => {
    const slug = slugOf(item);
    window.history.pushState({ ...(window.history.state ?? {}), [stateKey]: slug }, "", urlFor(slug));
    setSelected(item);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateKey]);

  const close = useCallback(() => {
    if (window.history.state?.[stateKey]) {
      window.history.back();
    } else {
      window.history.replaceState(null, "", closedUrl());
      setSelected(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateKey]);

  // Deep link: put the closed URL underneath so back from the drawer stays on the site.
  useEffect(() => {
    const item = find(slugFromLocation());
    if (!item) return;
    const slug = slugOf(item);
    window.history.replaceState(null, "", closedUrl());
    window.history.pushState({ [stateKey]: slug }, "", urlFor(slug));
    setSelected(item);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onPop = (e: PopStateEvent) => setSelected(find((e.state as Record<string, unknown> | null)?.[stateKey]));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateKey]);

  return { selected, open, close };
}
