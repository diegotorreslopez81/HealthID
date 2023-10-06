window.global ||= window;
import React from "react";
import ReactDOM from "react-dom";
import {
  createTheme,
  ThemeProvider,
  responsiveFontSizes,
  CssBaseline,
} from "@material-ui/core";
import "./index.css";
import App from "./App.js";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { Toaster } from 'react-hot-toast';
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import store from "./redux/store";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";
import moment from "moment";
const theme = responsiveFontSizes(
  createTheme({
    palette: {
      primary: {
        main: "#03DAC5",
      },
      secondary: {
        main: "#fff",
      },
      background: {
        default: "#f8f8f8",
      },
    },
    typography: {
      fontFamily: ["Poppins", "Roboto"].join(","),
    },
  })
);

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY as string);

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Elements stripe={stripePromise}>
          <Provider store={store}>
            <Toaster
              position="bottom-center"
              toastOptions={{
                duration: 2000,
                error: {
                  duration: 5000,
                },
              }}
            />
            <MuiPickersUtilsProvider utils={MomentUtils} libInstance={moment}>
              <App />
            </MuiPickersUtilsProvider>
          </Provider>
        </Elements>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();