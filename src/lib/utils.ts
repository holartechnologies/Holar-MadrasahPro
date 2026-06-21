import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), "dd MMM yyyy");
}

export function calculateGrade(total: number): string {
  if (total >= 70) return "A";
  if (total >= 60) return "B";
  if (total >= 50) return "C";
  if (total >= 45) return "D";
  if (total >= 40) return "E";
  return "F";
}

export function calculatePosition<T extends { total: number; studentId?: string }>(
  results: T[]
): (T & { position: number })[] {
  const sorted = [...results].sort((a, b) => b.total - a.total);
  return sorted.map((result, index) => ({
    ...result,
    position: index + 1,
  }));
}

export function generateReceiptNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RCP-${timestamp}-${random}`;
}
