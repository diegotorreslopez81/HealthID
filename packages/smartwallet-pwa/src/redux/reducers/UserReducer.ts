import { createSlice, createAction, current } from "@reduxjs/toolkit";
import {
  LS_USER_KEY,
  initialState,
} from "../../Const";
export const update = createAction("update");
export const addDynamicField = createAction("add-dynamic-field");
export const updateDynamicField = createAction("update-dynamic-field");
export const loadStoreData = createAction("load_store_data");
export const addArticles = createAction("add-articles");
export const importData = createAction("import"); 

const UserReducer = createSlice({
  name: "user",
  initialState,
  reducers: {
    //const field = state[action.payload.id] || {}
    update: (state: any, action) => {
      let newState;
      const { payload }: { payload: any; } = action;
      console.log(current(state));
      console.log(action.payload);
      const field = { ...state[payload.id], ...payload };
      newState = { ...state, [payload.id]: field };
      localStorage.setItem(LS_USER_KEY, JSON.stringify(newState));
      return newState;
    },

    addDynamicField: (state, action) => {
      let newState;
      const { payload } = action;
      console.log(current(state));
      console.log(action.payload);
      newState = {
        ...state,
        dynamicFields: state.dynamicFields.concat(payload),
      };
      localStorage.setItem(LS_USER_KEY, JSON.stringify(newState));
      return newState;
    },

    updateDynamicField: (state: any, action) => {
      let newState;
      const { payload } = action;
      console.log(current(state));
      console.log(action.payload);
      newState = {
        ...state,
        dynamicFields: state.dynamicFields.map((field: any) => {
          if (field.id === payload.id) {
            return { ...field, ...payload };
          }
          return field;
        }),
      };
      localStorage.setItem(LS_USER_KEY, JSON.stringify(newState));
      return newState;
    },

    addArticles: (state: any, action) => {
      let newState = {
        ...state,
        articles: [...state.articles, action.payload],
      };
      localStorage.setItem(LS_USER_KEY, JSON.stringify(newState));
      return newState;
    },

    loadStoreData: (state, action) => {
      return action.payload;
    },
    importData: (state, action) => {
      const data = action.payload;
      const dataKeys = Object.keys(data);

      const newState = {
        ...JSON.parse(data[LS_USER_KEY])
      };

      let lsCredentials = Object.keys(localStorage);

      lsCredentials = lsCredentials.filter((key) => key.includes('credential_'));

      lsCredentials.forEach((key) => localStorage.removeItem(key));

      dataKeys.forEach((key) => {
        if (key === LS_USER_KEY) {
          localStorage.setItem(key, JSON.stringify(newState));
        }
        else {
          localStorage.setItem(key, data[key]);
        }
      });

      return newState;
    },
  },
});

export default UserReducer.reducer;
