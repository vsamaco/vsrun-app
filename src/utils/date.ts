export function formatDate(date: Date, options?: Intl.DateTimeFormatOptions) {
  // undefined - default locale
  return new Intl.DateTimeFormat(undefined, options).format(date);
}
