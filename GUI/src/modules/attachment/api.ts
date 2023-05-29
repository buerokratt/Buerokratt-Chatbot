import instance from "services/api";
import { RUUTER_ENDPOINTS } from "utils/constants";

const sendAttachment = async (data:any) => {
    const body = { 
        chatId: data.chatId,
        name: data.name,
        type: data.type,
        size: data.size,
        base64: data.base64,
     };
    return instance({
      url: RUUTER_ENDPOINTS.SEND_ATTACHMENT,
      method: "POST",
      data: body,
    }).then(({ data }) => {
      return data;
    });
  };

  export default sendAttachment;
