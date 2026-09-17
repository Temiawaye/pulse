import type { TimeRange } from "@/lib/types";

export const TIME_RANGES: { value: TimeRange; label: string; minutes: number; bucketMinutes: number }[] = [
  { value: "1h", label: "1H", minutes: 60, bucketMinutes: 5 },
  { value: "24h", label: "24H", minutes: 1440, bucketMinutes: 60 },
  { value: "7d", label: "7D", minutes: 10080, bucketMinutes: 360 },
  { value: "30d", label: "30D", minutes: 43200, bucketMinutes: 1440 },
];

export const getRange = (value?: string) => TIME_RANGES.find((range) => range.value === value) ?? TIME_RANGES[1];
