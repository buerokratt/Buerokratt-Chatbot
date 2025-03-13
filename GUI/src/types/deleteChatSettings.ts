export interface DeleteChatSettings {
    isAuthConversations: boolean;
    authPeriod: number;
    isAnonymConversations: boolean;
    anonymPeriod: number;
    deletionTimeISO:  string;
    startDate: Date | string;
    endDate: Date | string;
}
