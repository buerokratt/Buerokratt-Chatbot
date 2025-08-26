export interface WidgetAppearance {
  widgetProactiveSeconds: number;
  widgetDisplayBubbleMessageSeconds: number;
  widgetBubbleMessageText: string;
  widgetColor: string;
  widgetAnimation: string;
  isWidgetActive: boolean;
  domainUUID?: string[];
}
export interface WidgetAppearanceResponse {
  response: WidgetAppearance;
}
