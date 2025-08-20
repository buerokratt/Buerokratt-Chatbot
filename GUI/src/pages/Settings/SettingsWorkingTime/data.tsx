import { OrganizationWorkingTime } from 'types/organizationWorkingTime';
import { dateToLocalExcludingDST, dateToUTCExcludingDST } from 'utils/convert-date';

export function getOrganizationTimeData(data: OrganizationWorkingTime) {
  return {
    organizationMondayWorkingTimeStartISO: dateToLocalExcludingDST(
      data.organizationMondayWorkingTimeStartISO
    ),
    organizationMondayWorkingTimeEndISO: dateToLocalExcludingDST(
      data.organizationMondayWorkingTimeEndISO
    ),
    organizationTuesdayWorkingTimeStartISO: dateToLocalExcludingDST(
      data.organizationTuesdayWorkingTimeStartISO
    ),
    organizationTuesdayWorkingTimeEndISO: dateToLocalExcludingDST(
      data.organizationTuesdayWorkingTimeEndISO
    ),
    organizationWednesdayWorkingTimeStartISO: dateToLocalExcludingDST(
      data.organizationWednesdayWorkingTimeStartISO
    ),
    organizationWednesdayWorkingTimeEndISO: dateToLocalExcludingDST(
      data.organizationWednesdayWorkingTimeEndISO
    ),
    organizationThursdayWorkingTimeStartISO: dateToLocalExcludingDST(
      data.organizationThursdayWorkingTimeStartISO
    ),
    organizationThursdayWorkingTimeEndISO: dateToLocalExcludingDST(
      data.organizationThursdayWorkingTimeEndISO
    ),
    organizationFridayWorkingTimeStartISO: dateToLocalExcludingDST(
      data.organizationFridayWorkingTimeStartISO
    ),
    organizationFridayWorkingTimeEndISO: dateToLocalExcludingDST(
      data.organizationFridayWorkingTimeEndISO
    ),
    organizationSaturdayWorkingTimeStartISO: dateToLocalExcludingDST(
      data.organizationSaturdayWorkingTimeStartISO
    ),
    organizationSaturdayWorkingTimeEndISO: dateToLocalExcludingDST(
      data.organizationSaturdayWorkingTimeEndISO
    ),
    organizationSundayWorkingTimeStartISO: dateToLocalExcludingDST(
      data.organizationSundayWorkingTimeStartISO
    ),
    organizationSundayWorkingTimeEndISO: dateToLocalExcludingDST(
      data.organizationSundayWorkingTimeEndISO
    ),
    organizationAllWeekdaysTimeStartISO: dateToLocalExcludingDST(
      data.organizationAllWeekdaysTimeStartISO
    ),
    organizationAllWeekdaysTimeEndISO: dateToLocalExcludingDST(
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
    organizationUseCSA: data.organizationUseCSA.toString() === 'true',
  };
}

export function setOrganizationTimeData(data: OrganizationWorkingTime) {
  const adjustedTimeFields: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    if (key.endsWith('ISO') && value) {
      adjustedTimeFields[key] = dateToUTCExcludingDST(value);
    } else {
      adjustedTimeFields[key] = value;
    }
  }

  return {
    ...adjustedTimeFields,
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
    organizationUseCSA: data.organizationUseCSA.toString(),
  };
}
