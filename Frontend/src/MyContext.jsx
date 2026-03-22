import { createContext } from "react";

export const MyContext = createContext({
  prompt: "",
  setPrompt: () => {},
  reply: null,
  setReply: () => {},
  currThreadId: "",
  setCurrThreadId: () => {},
  newChat: true,
  setNewChat: () => {},
  prevChats: [],
  setPrevChats: () => {},
  allThreads: [],
  setAllThreads: () => {},
});