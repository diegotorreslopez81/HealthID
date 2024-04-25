import { makeStyles, createTheme } from "@material-ui/core";

export const useStyles = makeStyles((theme) => ({
  subTitle: {
    margin: 'auto',
    padding: "0 20px 20px",
    fontWeight: "bold",
  },
  title: {
    textAlign: "center",
    padding: "0 20px 20px",
  },
  centrado: {
    margin: 'auto',
    padding: 0,
    textAlign: "center",
    alignContent: "center",
    marginBottom: 20,
    justifyContent: "center",
  },
  texField: {
    margin: 20,
  },
  button: {
    margin: 20,
    paddingRight: 85,
    paddingLeft: 85,
  },
  logo: {
    maxWidth: theme.spacing(50),
    marginBottom: 40,
  },
  claims: {
    
  },
  paper: {
    width: theme.spacing(40),
    borderRadius: 10,
    padding: "30px 0",
  },
  publisherProviderButtons: {
    marginTop: 30,
    textAlign: "center",
    alignContent: "center",
    justifyContent: "center",
  },
  publisherButton: {
    textAlign: "center",
  },
  userButton: {
    textAlign: "center",
  },
  clearSwitchPublisherButton: {
    color: "#c6c6c6",
    textAlign: "center",
    cursor: "pointer",
  },
  clearSwitchUserButton: {
    color: "#c6c6c6",
    textAlign: "center",
    cursor: "pointer",
  },
  labels: {
    color: "#a3a9ae",
    marginBottom: 10,
    cursor: "pointer",
    margin: 'auto',
    padding: 0,
    textAlign: "center",
    alignContent: "center",
    justifyContent: "center",    
  },
  decoratedText: {
    textDecoration: "line-through",
  },
  facebookButton: {
    width: 250,
    margin: "0px 10px 10px",
    justifyContent: "flex-start",
  },
  googleButton: {
    width: 250,
    margin: "0 10px",
    justifyContent: "flex-start",
  },
  userError: {
    margin: "0 20px",
  },
}));

export const userTheme = createTheme({
  palette: {
    type: "dark",
    primary: {
      main: "#fff",
    },
    secondary: {
      main: "#1c1c1c",
    },

    background: {
      default: "#000",
    },
  },
});

export const publisherTheme = createTheme({
  palette: {
    primary: {
      main: "#1c1c1c",
    },
    secondary: {
      main: "#fff",
    },
    background: {
      default: "#f8f8f8",
    },
  },
});
