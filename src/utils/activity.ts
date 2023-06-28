import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(duration);
dayjs.extend(relativeTime);

export const formatSeconds = (timeSeconds: number) => {
  return dayjs.duration(timeSeconds, "seconds").format("H:mm");
};

export const formatDate = (isoString: string) => {
  return dayjs(isoString).format("MMM D, YYYY");
};

export const formatTime = (isoString: string) => {
  return dayjs(isoString).format("h:mm a");
};

export const formatHumanizeSeconds = (seconds: number) => {
  return dayjs.duration(seconds, "seconds").format("H[h] m[m]");
};

export const metersToMiles = (i: number) => {
  return Math.round(i * 0.000621371192 * 100) / 100;
};

export const metersToFeet = (i: number) => {
  return i * 3.2808;
};
