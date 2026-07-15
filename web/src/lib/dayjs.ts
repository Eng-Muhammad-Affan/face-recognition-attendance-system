import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

const TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

dayjs.extend(utc);
dayjs.extend(timezone);

export const formatDate = (time: Date, format = "DD MMM YYYY") => {
  return dayjs(time).tz(TIMEZONE).format(format);
};

export default dayjs;
