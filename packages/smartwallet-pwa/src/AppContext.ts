import { createContext } from "react";

const AppContext = createContext({});

export default AppContext;

export const ContextProvider = AppContext.Provider;
