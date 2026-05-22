export function DateToMillis(dateStr: string) {
  return new Date(dateStr).getTime();
}

export function MillisToDate(millis: number) {
  return new Date(millis).toISOString().split('T')[0];
}
