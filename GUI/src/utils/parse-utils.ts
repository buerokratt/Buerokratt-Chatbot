import { Message, MessageButton } from "types/message";

export const parseOptions = (message: Message): string[] => {
  try {
    if(!message?.options || message.options === '')
      return [];
    return JSON.parse(message.options) as string[];
  } catch(e) {
    console.error(e);
    return [];
  }
}

export const parseButtons = (message: Message): MessageButton[] => {
  try {
    if(!message?.buttons || message.buttons === '')
      return [];
    return JSON.parse(message.buttons) as MessageButton[];
  } catch(e) {
    console.error(e);
    return [];
  }
}
