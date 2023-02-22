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
  updated?: string;
}
