import { OrganizationWorkingTime } from 'types/organizationWorkingTime';

function normalizeTimeString(value?: string | null): string {
  if (!value) return '08:00';
  if (value.includes('T')) {
    const date = new Date(value);
    return date.toLocaleTimeString('en-GB', {
      timeZone: 'Europe/Tallinn',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }
  return value.substring(0, 5);
}

export function getOrganizationTimeData(data: OrganizationWorkingTime) {
  return {
    organizationMondayWorkingTimeStartISO: normalizeTimeString(data.organizationMondayWorkingTimeStartISO),
    organizationMondayWorkingTimeEndISO: normalizeTimeString(data.organizationMondayWorkingTimeEndISO),
    organizationTuesdayWorkingTimeStartISO: normalizeTimeString(data.organizationTuesdayWorkingTimeStartISO),
    organizationTuesdayWorkingTimeEndISO: normalizeTimeString(data.organizationTuesdayWorkingTimeEndISO),
    organizationWednesdayWorkingTimeStartISO: normalizeTimeString(data.organizationWednesdayWorkingTimeStartISO),
    organizationWednesdayWorkingTimeEndISO: normalizeTimeString(data.organizationWednesdayWorkingTimeEndISO),
    organizationThursdayWorkingTimeStartISO: normalizeTimeString(data.organizationThursdayWorkingTimeStartISO),
    organizationThursdayWorkingTimeEndISO: normalizeTimeString(data.organizationThursdayWorkingTimeEndISO),
    organizationFridayWorkingTimeStartISO: normalizeTimeString(data.organizationFridayWorkingTimeStartISO),
    organizationFridayWorkingTimeEndISO: normalizeTimeString(data.organizationFridayWorkingTimeEndISO),
    organizationSaturdayWorkingTimeStartISO: normalizeTimeString(data.organizationSaturdayWorkingTimeStartISO),
    organizationSaturdayWorkingTimeEndISO: normalizeTimeString(data.organizationSaturdayWorkingTimeEndISO),
    organizationSundayWorkingTimeStartISO: normalizeTimeString(data.organizationSundayWorkingTimeStartISO),
    organizationSundayWorkingTimeEndISO: normalizeTimeString(data.organizationSundayWorkingTimeEndISO),
    organizationAllWeekdaysTimeStartISO: normalizeTimeString(data.organizationAllWeekdaysTimeStartISO),
    organizationAllWeekdaysTimeEndISO: normalizeTimeString(data.organizationAllWeekdaysTimeEndISO),
    organizationClosedOnWeekEnds: data.organizationClosedOnWeekEnds.toString() === 'true',
    organizationTheSameOnAllWorkingDays: data.organizationTheSameOnAllWorkingDays.toString() === 'true',
    organizationWorkingTimeNationalHolidays: data.organizationWorkingTimeNationalHolidays.toString() === 'true',
    organizationWorkingTimeWeekdays: data.organizationWorkingTimeWeekdays ?? [],
    organizationWorkingAllTime: data.organizationWorkingAllTime.toString() === 'true',
    organizationNoCsaAskForContacts: data.organizationNoCsaAskForContacts.toString() === 'true',
    organizationNoCsaAvailableMessage: data.organizationNoCsaAvailableMessage,
    organizationOutsideWorkingHoursAskForContacts:
      data.organizationOutsideWorkingHoursAskForContacts.toString() === 'true',
    organizationOutsideWorkingHoursMessage: data.organizationOutsideWorkingHoursMessage,
    organizationBotCannotAnswerMessage: data.organizationBotCannotAnswerMessage,
    organizationRedirectIfBotCannotAnswerMessage: data.organizationRedirectIfBotCannotAnswerMessage,
    organizationUseCSA: data.organizationUseCSA.toString() === 'true',
    organizationValidationNoCsaMessage: data.organizationValidationNoCsaMessage,
  };
}

export function setOrganizationTimeData(data: OrganizationWorkingTime) {
  return {
    ...data,
    organizationClosedOnWeekEnds: data.organizationClosedOnWeekEnds.toString(),
    organizationTheSameOnAllWorkingDays: data.organizationTheSameOnAllWorkingDays.toString() ?? false,
    organizationWorkingTimeNationalHolidays: data.organizationWorkingTimeNationalHolidays.toString(),
    organizationWorkingTimeWeekdays: data.organizationWorkingTimeWeekdays ?? ['monday'],
    organizationWorkingAllTime: data.organizationWorkingAllTime.toString() ?? false,
    organizationNoCsaAskForContacts: data.organizationNoCsaAskForContacts.toString(),
    organizationOutsideWorkingHoursAskForContacts: data.organizationOutsideWorkingHoursAskForContacts.toString(),
    organizationUseCSA: data.organizationUseCSA.toString() ?? true,
  };
}

export const getDefaultValues = (): OrganizationWorkingTime => {
  return {
    organizationMondayWorkingTimeStartISO: '08:00',
    organizationMondayWorkingTimeEndISO: '17:00',
    organizationTuesdayWorkingTimeStartISO: '08:00',
    organizationTuesdayWorkingTimeEndISO: '17:00',
    organizationWednesdayWorkingTimeStartISO: '08:00',
    organizationWednesdayWorkingTimeEndISO: '17:00',
    organizationThursdayWorkingTimeStartISO: '08:00',
    organizationThursdayWorkingTimeEndISO: '17:00',
    organizationFridayWorkingTimeStartISO: '08:00',
    organizationFridayWorkingTimeEndISO: '17:00',
    organizationSaturdayWorkingTimeStartISO: '08:00',
    organizationSaturdayWorkingTimeEndISO: '17:00',
    organizationSundayWorkingTimeStartISO: '08:00',
    organizationSundayWorkingTimeEndISO: '17:00',
    organizationAllWeekdaysTimeStartISO: '08:00',
    organizationAllWeekdaysTimeEndISO: '17:00',
    organizationWorkingTimeWeekdays: ['monday'],
    organizationWorkingTimeNationalHolidays: false,
    organizationClosedOnWeekEnds: false,
    organizationTheSameOnAllWorkingDays: false,
    organizationWorkingAllTime: false,
    organizationNoCsaAskForContacts: false,
    organizationNoCsaAvailableMessage: '',
    organizationOutsideWorkingHoursAskForContacts: false,
    organizationOutsideWorkingHoursMessage: '',
    organizationBotCannotAnswerMessage: '',
    organizationRedirectIfBotCannotAnswerMessage: '',
    organizationUseCSA: false,
    organizationValidationNoCsaMessage: '',
  };
};
