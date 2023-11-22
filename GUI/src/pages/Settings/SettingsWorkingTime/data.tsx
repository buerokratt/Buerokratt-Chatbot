import { OrganizationWorkingTime } from 'types/organizationWorkingTime';

export function getOrganizationTimeData(data: OrganizationWorkingTime) {
  console.log(data.organizationWednesdayWorkingTimeEndISO);
  return {
    organizationMondayWorkingTimeStartISO: convertToDate(
      data.organizationMondayWorkingTimeStartISO
    ),
    organizationMondayWorkingTimeEndISO: convertToDate(
      data.organizationMondayWorkingTimeEndISO
    ),
    organizationTuesdayWorkingTimeStartISO: convertToDate(
      data.organizationTuesdayWorkingTimeStartISO
    ),
    organizationTuesdayWorkingTimeEndISO: convertToDate(
      data.organizationTuesdayWorkingTimeEndISO
    ),
    organizationWednesdayWorkingTimeStartISO: convertToDate(
      data.organizationWednesdayWorkingTimeStartISO
    ),
    organizationWednesdayWorkingTimeEndISO: convertToDate(
      data.organizationWednesdayWorkingTimeEndISO
    ),
    organizationThursdayWorkingTimeStartISO: convertToDate(
      data.organizationThursdayWorkingTimeStartISO
    ),
    organizationThursdayWorkingTimeEndISO: convertToDate(
      data.organizationThursdayWorkingTimeEndISO
    ),
    organizationFridayWorkingTimeStartISO: convertToDate(
      data.organizationFridayWorkingTimeStartISO
    ),
    organizationFridayWorkingTimeEndISO: convertToDate(
      data.organizationFridayWorkingTimeEndISO
    ),
    organizationSaturdayWorkingTimeStartISO: convertToDate(
      data.organizationSaturdayWorkingTimeStartISO
    ),
    organizationSaturdayWorkingTimeEndISO: convertToDate(
      data.organizationSaturdayWorkingTimeEndISO
    ),
    organizationSundayWorkingTimeStartISO: convertToDate(
      data.organizationSundayWorkingTimeStartISO
    ),
    organizationSundayWorkingTimeEndISO: convertToDate(
      data.organizationSundayWorkingTimeEndISO
    ),
    organizationAllWeekdaysTimeStartISO: convertToDate(
      data.organizationAllWeekdaysTimeStartISO
    ),
    organizationAllWeekdaysTimeEndISO: convertToDate(
      data.organizationAllWeekdaysTimeEndISO
    ),
    organizationClosedOnWeekEnds:
      data.organizationClosedOnWeekEnds.toString() === 'true',
    organizationTheSameOnAllWorkingDays:
      data.organizationTheSameOnAllWorkingDays.toString() === 'true',
    organizationWorkingTimeNationalHolidays:
      data.organizationWorkingTimeNationalHolidays.toString() === 'true',
    organizationWorkingTimeWeekdays: data.organizationWorkingTimeWeekdays ?? [],
  };
}

export function setOrganizationTimeData(data: OrganizationWorkingTime) {
  return {
    ...data,
    organizationClosedOnWeekEnds: data.organizationClosedOnWeekEnds.toString(),
    organizationTheSameOnAllWorkingDays:
      data.organizationTheSameOnAllWorkingDays.toString(),
    organizationWorkingTimeNationalHolidays:
      data.organizationWorkingTimeNationalHolidays.toString(),
    organizationWorkingTimeWeekdays: data.organizationWorkingTimeWeekdays ?? [],
  };
}

const convertToDate = (dateAsString?: string | Date): Date =>
  dateAsString
    ? new Date(`${new Date(dateAsString).toLocaleString()} UTC`)
    : new Date();
