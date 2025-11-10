/**
 * Utility for merging Tailwind CSS classes
 * Filters out falsy values and joins remaining classes
 */
export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
