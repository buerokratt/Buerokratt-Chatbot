import { useMutation, useQueryClient } from '@tanstack/react-query';
import sendAttachment from './api';

const useSendAttachment = () => {
  const queryClient = useQueryClient();
  queryClient.setMutationDefaults(['send-attachment'], {
    mutationFn: (data) => sendAttachment(data),
    onMutate: async (variables) => {
      const { successCb, errorCb } = variables;
      return { successCb, errorCb };
    },
    onSuccess: (result, variables, context) => {
      if (context.successCb) {
        context.successCb(result);
      }
    },
    onError: (error, variables, context) => {
      if (context.errorCb) {
        context.errorCb(error);
      }
    },
  });
  return useMutation(['send-attachment']);
};
export default useSendAttachment;
