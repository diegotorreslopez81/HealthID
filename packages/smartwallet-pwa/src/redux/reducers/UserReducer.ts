import { createSlice, createAction, current } from "@reduxjs/toolkit";
import {
  LS_USER_KEY,
  initialState,
} from "../../Const";

const updateAction: any = createAction("update");
const addDynamicFieldAction: any = createAction("add-dynamic-field");
const updateDynamicFieldAction: any = createAction("update-dynamic-field");
const loadStoreDataAction: any = createAction("load_store_data");
const addArticlesAction: any = createAction("add-articles");
const importDataAction: any = createAction("import");
const addReport = createAction("add-report");

const UserReducer = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: {
    //const field = state[action.payload.id] || {}
    [updateAction]: (state: any, action) => {
      let newState;
      const { payload }: { payload: any; } = action;
      console.log(current(state));
      console.log(action.payload);
      const field = { ...state[payload.id], ...payload };
      newState = { ...state, [payload.id]: field };
      localStorage.setItem(LS_USER_KEY, JSON.stringify(newState));
      return newState;
    },

    [addDynamicFieldAction]: (state, action) => {
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

    [updateDynamicFieldAction]: (state: any, action) => {
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

    [addArticlesAction]: (state: any, action) => {
      let newState = {
        ...state,
        articles: [...state.articles, action.payload],
      };
      localStorage.setItem(LS_USER_KEY, JSON.stringify(newState));
      return newState;
    },

    [loadStoreDataAction]: (_, action) => {
      return action.payload;
    },
    [importDataAction]: (_, action) => {
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

    [addReport.toString()]: (state: any, action: any) => {
      const oldReportsId = new Set();
      const newReports: any[] = [];

      if (state?.reports?.length) {
        state.reports?.forEach((report: any) => {
          if (!oldReportsId.has(report._id)) {
            oldReportsId.add(report._id);
            newReports.push(report);
          }
        });
      }

      action.payload.forEach((report: any) => {
        if (!oldReportsId.has(report._id)) {
          oldReportsId.add(report._id);
          newReports.push(report);
        }
      });

      let newState = {
        ...state,
        reports: newReports,
      };
      localStorage.setItem(LS_USER_KEY, JSON.stringify(newState));
      return newState;
    },
  },
});

const { reducer } = UserReducer;

export default reducer;
