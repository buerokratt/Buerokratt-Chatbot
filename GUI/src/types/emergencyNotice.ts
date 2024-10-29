export interface EmergencyNotice {
  emergencyNoticeText: string;
  emergencyNoticeStartISO: Date | string;
  emergencyNoticeEndISO: Date | string;
  isEmergencyNoticeVisible: boolean;
}

export interface EmergencyNoticeResponse {
  response: EmergencyNotice;
}
