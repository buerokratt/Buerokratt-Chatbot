export interface OrganizationWorkingTime {
  organizationMondayWorkingTimeStartISO: string;
  organizationMondayWorkingTimeEndISO: string;
  organizationTuesdayWorkingTimeStartISO: string;
  organizationTuesdayWorkingTimeEndISO: string;
  organizationWednesdayWorkingTimeStartISO: string;
  organizationWednesdayWorkingTimeEndISO: string;
  organizationThursdayWorkingTimeStartISO: string;
  organizationThursdayWorkingTimeEndISO: string;
  organizationFridayWorkingTimeStartISO: string;
  organizationFridayWorkingTimeEndISO: string;
  organizationSaturdayWorkingTimeStartISO: string;
  organizationSaturdayWorkingTimeEndISO: string;
  organizationSundayWorkingTimeStartISO: string;
  organizationSundayWorkingTimeEndISO: string;
  organizationAllWeekdaysTimeStartISO: string;
  organizationAllWeekdaysTimeEndISO: string;
  organizationWorkingTimeWeekdays: string[];
  organizationWorkingTimeNationalHolidays: boolean;
  organizationClosedOnWeekEnds: boolean;
  organizationTheSameOnAllWorkingDays: boolean;
  organizationWorkingAllTime: boolean;
  organizationNoCsaAskForContacts: boolean;
  organizationNoCsaAvailableMessage: string;
  organizationOutsideWorkingHoursAskForContacts: boolean;
  organizationOutsideWorkingHoursMessage: string;
  organizationBotCannotAnswerMessage: string;
  organizationRedirectIfBotCannotAnswerMessage: string;
  organizationUseCSA: boolean;
  organizationValidationNoCsaMessage: string;
  domainUUID?: string[];
}

export interface OrganizationWorkingTimeResponse {
  response: OrganizationWorkingTime;
}
