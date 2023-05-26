export interface OrganizationWorkingTime {
  organizationWorkingTimeStartISO: Date | string;
  organizationWorkingTimeEndISO: Date | string;
  organizationWorkingTimeWeekdays: string[];
  organizationWorkingTimeNationalHolidays: boolean;
}
