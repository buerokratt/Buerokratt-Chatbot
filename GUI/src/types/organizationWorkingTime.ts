export interface OrganizationWorkingTime {
  organizationMondayWorkingTimeStartISO: Date | string;
  organizationMondayWorkingTimeEndISO: Date | string;
  organizationTuesdayWorkingTimeStartISO: Date | string;
  organizationTuesdayWorkingTimeEndISO: Date | string;
  organizationWednesdayWorkingTimeStartISO: Date | string;
  organizationWednesdayWorkingTimeEndISO: Date | string;
  organizationThursdayWorkingTimeStartISO: Date | string;
  organizationThursdayWorkingTimeEndISO: Date | string;
  organizationFridayWorkingTimeStartISO: Date | string;
  organizationFridayWorkingTimeEndISO: Date | string;
  organizationSaturdayWorkingTimeStartISO: Date | string;
  organizationSaturdayWorkingTimeEndISO: Date | string;
  organizationSundayWorkingTimeStartISO: Date | string;
  organizationSundayWorkingTimeEndISO: Date | string;
  organizationAllWeekdaysTimeStartISO: Date | string;
  organizationAllWeekdaysTimeEndISO: Date | string;
  organizationWorkingTimeWeekdays: string[];
  organizationWorkingTimeNationalHolidays: boolean;
  organizationClosedOnWeekEnds: boolean;
  organizationTheSameOnAllWorkingDays: boolean;
}
