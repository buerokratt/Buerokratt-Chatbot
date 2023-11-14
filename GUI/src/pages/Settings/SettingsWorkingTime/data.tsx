import { OrganizationWorkingTime } from 'types/organizationWorkingTime';

export function getOrganizationTimeData(data: OrganizationWorkingTime) {
  return {
    organizationMondayWorkingTimeStartISO:
      data.organizationMondayWorkingTimeStartISO
        ? new Date(data.organizationMondayWorkingTimeStartISO)
        : new Date(),
    organizationMondayWorkingTimeEndISO:
      data.organizationMondayWorkingTimeEndISO
        ? new Date(data.organizationMondayWorkingTimeEndISO)
        : new Date(),
    organizationTuesdayWorkingTimeStartISO:
      data.organizationTuesdayWorkingTimeStartISO
        ? new Date(data.organizationTuesdayWorkingTimeStartISO)
        : new Date(),
    organizationTuesdayWorkingTimeEndISO:
      data.organizationTuesdayWorkingTimeEndISO
        ? new Date(data.organizationTuesdayWorkingTimeEndISO)
        : new Date(),
    organizationWednesdayWorkingTimeStartISO:
      data.organizationWednesdayWorkingTimeStartISO
        ? new Date(data.organizationWednesdayWorkingTimeStartISO)
        : new Date(),
    organizationWednesdayWorkingTimeEndISO:
      data.organizationWednesdayWorkingTimeEndISO
        ? new Date(data.organizationWednesdayWorkingTimeEndISO)
        : new Date(),
    organizationThursdayWorkingTimeStartISO:
      data.organizationThursdayWorkingTimeStartISO
        ? new Date(data.organizationThursdayWorkingTimeStartISO)
        : new Date(),
    organizationThursdayWorkingTimeEndISO:
      data.organizationThursdayWorkingTimeEndISO
        ? new Date(data.organizationThursdayWorkingTimeEndISO)
        : new Date(),
    organizationFridayWorkingTimeStartISO:
      data.organizationFridayWorkingTimeStartISO
        ? new Date(data.organizationFridayWorkingTimeStartISO)
        : new Date(),
    organizationFridayWorkingTimeEndISO:
      data.organizationFridayWorkingTimeEndISO
        ? new Date(data.organizationFridayWorkingTimeEndISO)
        : new Date(),
    organizationSaturdayWorkingTimeStartISO:
      data.organizationSaturdayWorkingTimeStartISO
        ? new Date(data.organizationSaturdayWorkingTimeStartISO)
        : new Date(),
    organizationSaturdayWorkingTimeEndISO:
      data.organizationSaturdayWorkingTimeEndISO
        ? new Date(data.organizationSaturdayWorkingTimeEndISO)
        : new Date(),
    organizationSundayWorkingTimeStartISO:
      data.organizationSundayWorkingTimeStartISO
        ? new Date(data.organizationSundayWorkingTimeStartISO)
        : new Date(),
    organizationSundayWorkingTimeEndISO:
      data.organizationSundayWorkingTimeEndISO
        ? new Date(data.organizationSundayWorkingTimeEndISO)
        : new Date(),
    organizationAllWeekdaysTimeStartISO:
      data.organizationAllWeekdaysTimeStartISO
        ? new Date(data.organizationAllWeekdaysTimeStartISO)
        : new Date(),
    organizationAllWeekdaysTimeEndISO: data.organizationAllWeekdaysTimeEndISO
      ? new Date(data.organizationAllWeekdaysTimeEndISO)
      : new Date(),
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
    organizationMondayWorkingTimeStartISO:
      data.organizationMondayWorkingTimeStartISO,
    organizationMondayWorkingTimeEndISO:
      data.organizationMondayWorkingTimeEndISO,
    organizationTuesdayWorkingTimeStartISO:
      data.organizationTuesdayWorkingTimeStartISO,
    organizationTuesdayWorkingTimeEndISO:
      data.organizationTuesdayWorkingTimeEndISO,
    organizationWednesdayWorkingTimeStartISO:
      data.organizationWednesdayWorkingTimeStartISO,
    organizationWednesdayWorkingTimeEndISO:
      data.organizationWednesdayWorkingTimeEndISO,
    organizationThursdayWorkingTimeStartISO:
      data.organizationThursdayWorkingTimeStartISO,
    organizationThursdayWorkingTimeEndISO:
      data.organizationThursdayWorkingTimeEndISO,
    organizationFridayWorkingTimeStartISO:
      data.organizationFridayWorkingTimeStartISO,
    organizationFridayWorkingTimeEndISO:
      data.organizationFridayWorkingTimeEndISO,
    organizationSaturdayWorkingTimeStartISO:
      data.organizationSaturdayWorkingTimeStartISO,
    organizationSaturdayWorkingTimeEndISO:
      data.organizationSaturdayWorkingTimeEndISO,
    organizationSundayWorkingTimeStartISO:
      data.organizationSundayWorkingTimeStartISO,
    organizationSundayWorkingTimeEndISO:
      data.organizationSundayWorkingTimeEndISO,
    organizationAllWeekdaysTimeStartISO:
      data.organizationAllWeekdaysTimeStartISO,
    organizationAllWeekdaysTimeEndISO: data.organizationAllWeekdaysTimeEndISO,
    organizationClosedOnWeekEnds: data.organizationClosedOnWeekEnds.toString(),
    organizationTheSameOnAllWorkingDays:
      data.organizationTheSameOnAllWorkingDays.toString(),
    organizationWorkingTimeNationalHolidays:
      data.organizationWorkingTimeNationalHolidays.toString(),
    organizationWorkingTimeWeekdays: data.organizationWorkingTimeWeekdays ?? [],
  };
}
