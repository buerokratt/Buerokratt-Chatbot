import { FeedbackConfig } from 'types/feedbackConfig';

export function getFeedbackConfigData(data: FeedbackConfig) {
  return {
    feedbackActive: data.feedbackActive.toString() === 'true',
    feedbackQuestion: data.feedbackQuestion,
    feedbackNoticeActive: data.feedbackNoticeActive.toString() === 'true',
    feedbackNotice: data.feedbackNotice,
    isFiveRatingScale: data.isFiveRatingScale?.toString() === 'true',
  };
}

export function setFeedbackData(data: FeedbackConfig) {
  return {
    ...data,
    feedbackActive: data.feedbackActive.toString(),
    feedbackNoticeActive: data.feedbackNoticeActive.toString(),
    isFiveRatingScale: data.isFiveRatingScale?.toString(),
  };
}
