import { OrganizationWorkingTime } from 'types/organizationWorkingTime';

export function getOrganizationTimeData(data: OrganizationWorkingTime) {
  return {
    organizationMondayWorkingTimeStartISO: convertDate(
      data.organizationMondayWorkingTimeStartISO
    ),
    organizationMondayWorkingTimeEndISO: convertDate(
      data.organizationMondayWorkingTimeEndISO
    ),
    organizationTuesdayWorkingTimeStartISO: convertDate(
      data.organizationTuesdayWorkingTimeStartISO
    ),
    organizationTuesdayWorkingTimeEndISO: convertDate(
      data.organizationTuesdayWorkingTimeEndISO
    ),
    organizationWednesdayWorkingTimeStartISO: convertDate(
      data.organizationWednesdayWorkingTimeStartISO
    ),
    organizationWednesdayWorkingTimeEndISO: convertDate(
      data.organizationWednesdayWorkingTimeEndISO
    ),
    organizationThursdayWorkingTimeStartISO: convertDate(
      data.organizationThursdayWorkingTimeStartISO
    ),
    organizationThursdayWorkingTimeEndISO: convertDate(
      data.organizationThursdayWorkingTimeEndISO
    ),
    organizationFridayWorkingTimeStartISO: convertDate(
      data.organizationFridayWorkingTimeStartISO
    ),
    organizationFridayWorkingTimeEndISO: convertDate(
      data.organizationFridayWorkingTimeEndISO
    ),
    organizationSaturdayWorkingTimeStartISO: convertDate(
      data.organizationSaturdayWorkingTimeStartISO
    ),
    organizationSaturdayWorkingTimeEndISO: convertDate(
      data.organizationSaturdayWorkingTimeEndISO
    ),
    organizationSundayWorkingTimeStartISO: convertDate(
      data.organizationSundayWorkingTimeStartISO
    ),
    organizationSundayWorkingTimeEndISO: convertDate(
      data.organizationSundayWorkingTimeEndISO
    ),
    organizationAllWeekdaysTimeStartISO: convertDate(
      data.organizationAllWeekdaysTimeStartISO
    ),
    organizationAllWeekdaysTimeEndISO: convertDate(
      data.organizationAllWeekdaysTimeEndISO
    ),
    organizationClosedOnWeekEnds:
      data.organizationClosedOnWeekEnds.toString() === 'true',
    organizationTheSameOnAllWorkingDays:
      data.organizationTheSameOnAllWorkingDays.toString() === 'true',
    organizationWorkingTimeNationalHolidays:
      data.organizationWorkingTimeNationalHolidays.toString() === 'true',
    organizationWorkingTimeWeekdays: data.organizationWorkingTimeWeekdays ?? [],
    organizationWorkingAllTime:
      data.organizationWorkingAllTime.toString() === 'true',
    organizationNoCsaAskForContacts:
      data.organizationNoCsaAskForContacts.toString() === 'true',
    organizationNoCsaAvailableMessage: data.organizationNoCsaAvailableMessage,
    organizationOutsideWorkingHoursAskForContacts:
      data.organizationOutsideWorkingHoursAskForContacts.toString() === 'true',
    organizationOutsideWorkingHoursMessage:
      data.organizationOutsideWorkingHoursMessage,
    organizationBotCannotAnswerAskToForwardToCSA:
      data.organizationBotCannotAnswerAskToForwardToCSA.toString() === 'true',
    organizationBotCannotAnswerMessage: data.organizationBotCannotAnswerMessage,
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
    organizationWorkingAllTime: data.organizationWorkingAllTime.toString(),
    organizationNoCsaAskForContacts:
      data.organizationNoCsaAskForContacts.toString(),
    organizationOutsideWorkingHoursAskForContacts:
      data.organizationOutsideWorkingHoursAskForContacts.toString(),
    organizationBotCannotAnswerAskToForwardToCSA:
      data.organizationBotCannotAnswerAskToForwardToCSA.toString(),
  };
}

const convertDate = (dateAsString?: string | Date): Date =>
  dateAsString ? new Date(dateAsString) : new Date();
