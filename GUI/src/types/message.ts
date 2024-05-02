export interface UseSendAttachment {
  successCb?: (data: any) => void;
  errorCb?: (error: any) => void;
  data: {
    chatId: string,
    name: string,
    type: string,
    size: string,
    base64: string,
  }
}

export interface Attachment {
  chatId: string;
  name: string;
  type: AttachmentTypes;
  size: number;
  base64: string;
}

export interface Message {
  id?: string;
  chatId: string;
  content?: string;
  event?: string;
  authorId?: string;
  authorTimestamp: string;
  authorFirstName: string;
  authorLastName?: string;
  authorRole: string;
  forwardedByUser: string;
  forwardedFromCsa: string;
  forwardedToCsa: string;
  rating?: string;
  created?: string;
  preview?: string;
  updated?: string;
}

export interface MessagePreviewSseResponse {
  data: Message;
  origin: string;
  type: string;
}

export enum AttachmentTypes {
  PDF = 'application/pdf',
  PNG = 'image/png',
  JPEG = 'image/jpeg',
  TXT = 'text/plain',
  DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ODT = 'application/vnd.oasis.opendocument.text',
  XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ODS = 'ods',
  CDOC = 'application/x-cdoc',
  ASICE = 'application/vnd.etsi.asic-e+zip',
  MP3 = 'audio/mpeg',
  WAV = 'audio/wav',
  M4A = 'audio/x-m4a',
  MP4 = 'video/mp4',
  WEBM = 'video/webm',
  OGG = 'video/ogg',
  MOV = 'video/quicktime',
}
