const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const MONTH_KEY_PATTERN = /^\d{4}-\d{2}$/;

function createUtcMonthDate(year: number, monthIndex: number) {
  return new Date(Date.UTC(year, monthIndex, 1));
}

export function isValidMonthKey(value: string) {
  return MONTH_KEY_PATTERN.test(value);
}

export function getCurrentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function parseMonthKey(monthKey: string) {
  const [yearText, monthText] = monthKey.split("-");
  return {
    year: Number(yearText),
    monthIndex: Number(monthText) - 1,
  };
}

export function makeMonthKey(year: number, monthIndex: number) {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
}

export function shiftMonthKey(monthKey: string, amount: number) {
  const { year, monthIndex } = parseMonthKey(monthKey);
  const shifted = createUtcMonthDate(year, monthIndex + amount);
  return makeMonthKey(shifted.getUTCFullYear(), shifted.getUTCMonth());
}

export function compareMonthKeys(left: string, right: string) {
  return left.localeCompare(right);
}

export function formatMonthLabel(monthKey: string) {
  const { year, monthIndex } = parseMonthKey(monthKey);
  return monthFormatter.format(createUtcMonthDate(year, monthIndex));
}

export function toMonthKeyFromDateString(dateString: string) {
  return dateString.slice(0, 7);
}

export function getMonthKeysBetween(startMonthKey: string, endMonthKey: string) {
  const months: string[] = [];
  let current = startMonthKey;

  while (compareMonthKeys(current, endMonthKey) <= 0) {
    months.push(current);
    current = shiftMonthKey(current, 1);
  }

  return months;
}

export function getDefaultDateForMonth(monthKey: string) {
  const today = new Date();
  const todayMonthKey = getCurrentMonthKey();

  if (monthKey === todayMonthKey) {
    return today.toISOString().split("T")[0];
  }

  return `${monthKey}-01`;
}

export function getSeasonWindow(monthKey: string) {
  const { year, monthIndex } = parseMonthKey(monthKey);

  let seasonName = "Spring";
  let rangeLabel = "Mar-May";
  let startMonthIndex = 2;
  let startYear = year;
  let monthsIntoSeason = monthIndex - 2;

  if (monthIndex === 11 || monthIndex <= 1) {
    seasonName = "Winter";
    rangeLabel = "Dec-Feb";
    startMonthIndex = 11;
    startYear = monthIndex === 11 ? year : year - 1;
    monthsIntoSeason = monthIndex === 11 ? 0 : monthIndex + 1;
  } else if (monthIndex >= 5 && monthIndex <= 7) {
    seasonName = "Summer";
    rangeLabel = "Jun-Aug";
    startMonthIndex = 5;
    monthsIntoSeason = monthIndex - 5;
  } else if (monthIndex >= 8 && monthIndex <= 10) {
    seasonName = "Fall";
    rangeLabel = "Sep-Nov";
    startMonthIndex = 8;
    monthsIntoSeason = monthIndex - 8;
  }

  const startKey = makeMonthKey(startYear, startMonthIndex);
  const previousStartKey = makeMonthKey(startYear - 1, startMonthIndex);
  const previousEndKey = shiftMonthKey(previousStartKey, monthsIntoSeason);
  const label =
    seasonName === "Winter"
      ? `${seasonName} ${startYear}-${startYear + 1}`
      : `${seasonName} ${startYear}`;
  const comparisonLabel =
    seasonName === "Winter"
      ? `${seasonName} ${startYear - 1}-${startYear}`
      : `${seasonName} ${startYear - 1}`;

  return {
    label,
    rangeLabel,
    startKey,
    endKey: monthKey,
    previousStartKey,
    previousEndKey,
    monthsIntoSeason,
    comparisonLabel,
  };
}
