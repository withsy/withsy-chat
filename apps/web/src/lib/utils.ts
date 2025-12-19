import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function filterUndefinedValue<T extends object>(object: T): T {
  return Object.fromEntries(
    Object.entries(object).filter(([_, v]) => v !== undefined)
  ) as T;
}
