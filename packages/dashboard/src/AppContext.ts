import { MutableRefObject, createContext } from "react";
import { Socket } from "socket.io-client";

interface AppContextI {
  isUserAuthed: boolean,
  userRole: any,
  userId: string,
  userPhoto: string,
  setUserRole: Function,
  setIsLoading: Function,
  logout: Function,
  socket: MutableRefObject<Socket<any, any> | undefined> | undefined,
  isSocketConnected: boolean,
}

const AppContext = createContext<AppContextI>({
  isUserAuthed: false,
  userRole: '',
  userId: '',
  userPhoto: '',
  setUserRole: () => { },
  setIsLoading: () => { },
  logout: () => { },
  socket: undefined,
  isSocketConnected: false,
});

export default AppContext;
