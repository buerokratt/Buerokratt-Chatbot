export function calculateDateDifference(value) {
  const { startDate, endDate, outputType } = value;
  const sDate = new Date(startDate);
  const eDate = new Date(endDate);
  const timeDifferenceInSeconds = (eDate.getTime() - sDate.getTime()) / 1000;

  switch (outputType?.toLowerCase()) {
    case "years":
      const differenceInYears = eDate.getFullYear() - sDate.getFullYear();
      return differenceInYears;
    case "months":
      const differenceInMonths =
        eDate.getMonth() -
        sDate.getMonth() +
        12 * (eDate.getFullYear() - sDate.getFullYear());
      return differenceInMonths;
    case "hours":
      const differenceInHours = Math.round(Math.abs(eDate - sDate) / 36e5);
      return differenceInHours;
    case "minutes":
      const differenceInMinutes = Math.floor(timeDifferenceInSeconds / 60);
      return differenceInMinutes;
    case "seconds":
      return timeDifferenceInSeconds;
    default:
      const differenceInDays = Math.round(
        timeDifferenceInSeconds / (3600 * 24)
      );
      return differenceInDays;
  }
}

export function stringToList(str, block) {
  var out = "";
  if (!str) return "";
  const parts = str.split(",");
  parts.map(function (prop, i) {
    out += block.fn({ value: `"${prop}"${i < parts.length - 1 ? "," : ""}` });
  });
  return out;
}
