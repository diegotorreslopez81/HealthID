import { configureStore } from "@reduxjs/toolkit";
import UserReducer from "./reducers/UserReducer";

const store = configureStore({
  reducer: {
    store: UserReducer,
  },
});

export default store;