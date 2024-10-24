export interface DeleteChatSettings {
    isAuthConversations: boolean;
    authPeriod: number;
    isAnonymConversations: boolean;
    anonymPeriod: number;
    deletionTimeISO: Date | string;
}
