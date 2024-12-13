export interface EmergencyNotice {
  emergencyNoticeText: string;
  emergencyNoticeStartISO: Date | string;
  emergencyNoticeEndISO: Date | string;
  isEmergencyNoticeVisible: string;
}

export interface EmergencyNoticeResponse {
  response: EmergencyNotice;
}
