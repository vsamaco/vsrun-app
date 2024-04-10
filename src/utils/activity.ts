import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { type JSONValue } from "superjson/dist/types";

dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);

export const formatSeconds = (timeSeconds: number) => {
  return dayjs.duration(timeSeconds, "seconds").format("H:mm");
};

export const formatDate = (isoString: string) => {
  return dayjs(isoString).format("MMM D, YYYY");
};

export const formatEventDate = (event_date: Date) => {
  return dayjs(event_date).format("MMM.D.YYYY");
};

export const formatTime = (isoString: string) => {
  return dayjs(isoString).format("h:mm a");
};

export const formatHumanizeSeconds = (seconds: number) => {
  return dayjs.duration(seconds, "seconds").format("H[h] m[m]");
};

export const formatDurationHMS = (seconds: number) => {
  return dayjs.duration(seconds, "seconds").format("H:mm:ss");
};

export const parseHmsToSeconds = (input: string) => {
  const time = dayjs(input, "h:mm:ss");
  return time.hour() * 3600 + time.minute() * 60 + time.second();
};

export const parseDateMonth = (weekDate: Date) => {
  return dayjs(weekDate).format("MMM");
};

export const parseDateDay = (weekDate: Date) => {
  return dayjs(weekDate).format("D");
};

export const metersToMiles = (i: number) => {
  return roundNumber(i * 0.000621371192);
};

export const milesToMeters = (mi: number) => {
  return mi * 1609.344;
};

export const metersToFeet = (i: number) => {
  return roundNumber(i * 3.2808);
};

export const feetToMeters = (ft: number) => {
  return ft * 0.3048;
};

export const isEmpty = (obj: JSONValue | object) => {
  return !obj || Object.keys(obj).length === 0;
};

const roundNumber = (num: number) => {
  return +num.toFixed(2);
};
