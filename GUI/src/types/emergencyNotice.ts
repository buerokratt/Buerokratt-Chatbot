export interface EmergencyNotice {
  emergencyNoticeText: string;
  emergencyNoticeStartISO: Date | string;
  emergencyNoticeEndISO: Date | string;
  // todo BE?
  isEmergencyNoticeVisible: string;
}

export interface EmergencyNoticeResponse {
  response: EmergencyNotice;
}
