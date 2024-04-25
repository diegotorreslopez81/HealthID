import { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router";
import {
  TextField,
  Paper,
  Button,
  Grid,
  Typography,
  ThemeProvider,
  CssBaseline,
  FormHelperText,
} from "@material-ui/core";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider
} from "firebase/auth";
import ForgotPassword from './ForgotPassword/ForgotPassword';
import { getAuth } from "firebase/auth";
import apiService from "../../Services/apiService";
import AppContext from "../../AppContext";
import HealthIDLogo from "../../Assets/Images/HealthID-horizontal.png";
import FacebookLogo from "../../Assets/svg/FacebookLogo.js";
import GoogleLogo from "../../Assets/svg/GoogleLogo.js";
import { useStyles, publisherTheme } from "./styles";
import { getRoleFromUserClaims } from "../../Services/utilsService";
import {
  LS_KEY_ROLE,
  LS_KEY_TOKEN,
  ROLES_DEFAULT_ROUTES,
  ROLE_PUBLISHER,
  ROLE_ISSUER,
} from "../../Constants";

const PROVIDER_GOOGLE = "PROVIDER_GOOGLE";
const PROVIDER_FACEBOOK = "PROVIDER_FACEBOOK";

interface FirebaseError {
  message: string;
  origin: string;
}

const auth = getAuth();

const Login = () => {
  const classes: any = useStyles();
  const history = useHistory();
  const { setUserRole, setIsLoading, logout } = useContext(AppContext);
  const [userType, setUserType] = useState(localStorage.getItem(LS_KEY_ROLE));
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [error, setError] = useState<FirebaseError>({
    message: '',
    origin: '',
  });
  const [forgotPassword, setForgotPassword] = useState(false);

  useEffect(() => {
    localStorage.setItem(LS_KEY_ROLE, userType as string);
  }, [userType]);

  const handleChangeLoginRegister = () => {
    setIsLogin(!isLogin);
  };

  const isLoginWithCorrectRole = (userRole: string) =>
    userRole === "admin" || userRole === userType;

  const handleLoginEmail = async () => {
    try {
      setIsLoading(true);
      let userCredential;
      let tokenData;
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        tokenData = await userCredential.user!.getIdTokenResult();
      } else {
        if (password !== passwordRepeat) {
          throw new Error("Passwords mismatch");
        }

        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const token = await userCredential.user!.getIdToken();
        await apiService.post("/register/setCustomClaims", {
          token: token,
          claim: localStorage.getItem(LS_KEY_ROLE),
        });
        // Refresh token to get the user role
        tokenData = await userCredential.user!.getIdTokenResult(true);
      }

      const userRole = getRoleFromUserClaims(tokenData.claims);
      if (!isLoginWithCorrectRole(userRole)) {
        throw new Error("Invalid role");
      }
      setError({
        message: '',
        origin: '',
      });
      setUserRole(userRole);
      localStorage.setItem(LS_KEY_TOKEN, tokenData.token);
      history.push(ROLES_DEFAULT_ROUTES[userRole]);
    } catch (err: any) {
      console.log("nok", err!.message);
      console.log(err);
      setError({
        message: err!.message,
        origin: "email",
      })
      setIsLoading(false);
      logout();
    }
  };

  const handleLoginProvider = async (providerName: string) => {
    const provider =
      providerName === PROVIDER_GOOGLE
        ? new GoogleAuthProvider()
        : new FacebookAuthProvider();

    try {
      setIsLoading(true);
      const userCredential = await signInWithPopup(auth, provider);
      const userExist = await apiService.post("/register/userExist", { uid: userCredential.user.uid });
      let tokenData;

      if (!userExist.data.exist) {
        const token = await userCredential.user!.getIdToken();
        await apiService.post("/register/setCustomClaims", {
          token: token,
          claim: localStorage.getItem(LS_KEY_ROLE),
        });
        // Refresh token to get the user role
        tokenData = await userCredential.user!.getIdTokenResult(true);
      } else {
        tokenData = await userCredential.user!.getIdTokenResult();
      }

      const userRole = getRoleFromUserClaims(tokenData.claims);
      if (!isLoginWithCorrectRole(userRole)) {
        throw new Error("Invalid role");
      }
      setError({
        message: '',
        origin: '',
      });
      setUserRole(userRole);
      localStorage.setItem(LS_KEY_TOKEN, tokenData.token);
      history.push(ROLES_DEFAULT_ROUTES[userRole]);
    } catch (err: any) {
      console.log("nok", err.message);
      setError({
        message: err!.message,
        origin: provider as unknown as string,
      })
      setIsLoading(false);
      logout();
    }
  };

  return (
    <ThemeProvider theme={publisherTheme}>
      <div style={{  margin: 'auto', width: '60%', padding: 10, }}> 
      <CssBaseline />
      <Grid className={classes.centrado}>
        <Grid >
          <img
            src={HealthIDLogo}
            alt="logo"
            className={classes.logo}
          />
        </Grid>
      </Grid>
      <Grid container className={classes.centrado}>
        <Grid item xs={3}>
          <Typography
            onClick={() => {
              setUserType(ROLE_PUBLISHER)
              setError({
                message: '',
                origin: '',
              });
            }}
            variant='body2'
            className={
              userType === ROLE_PUBLISHER ?
                classes.publisherButton :
                classes.clearSwitchPublisherButton
            }
          >
            For admins
          </Typography>
        </Grid>
        <Grid item xs={3}>
          <Typography
            onClick={() => {
              setUserType(ROLE_ISSUER)
              setError({
                message: '',
                origin: '',
              });
            }}
            variant='body2'
            className={
              userType === ROLE_PUBLISHER ?
                classes.clearSwitchUserButton :
                classes.userButton
            }
          >
            For issuers
          </Typography>
        </Grid>
      </Grid>
      <ThemeProvider theme={publisherTheme}>
        <Grid container className={classes.centrado}>
          <Grid >
            <Typography variant="h4" className={classes.title}>
              Electronic Medical Records in Blockchain
            </Typography>
          </Grid>
          <Grid container item xs={12} justify-content="center" className={classes.centrado}>
            <Paper className={classes.paper}>
              {userType === ROLE_PUBLISHER ? !forgotPassword ? (
                <>
                  <Grid>
                    <Typography variant="subtitle1">
                      {isLogin ? "Login with Email" : "Register as admin"}
                    </Typography>
                  </Grid>
                  <Grid>
                    <Grid item  >
                      <TextField
                        label="Your email addres"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                      />
                    </Grid>
                    <Grid container >
                      <TextField
                        label="Your password"
                        value={password}
                        type="password"
                        onChange={(event) => setPassword(event.target.value)}
                        className={classes.centrado}
                      />
                    </Grid>
                    {!isLogin && (
                      <Grid container >
                        <TextField
                          className={classes.centrado}
                          label="Repeat your password"
                          value={passwordRepeat}
                          type="password"
                          onChange={(event) =>
                            setPasswordRepeat(event.target.value)
                          }
                          error={password !== passwordRepeat}
                          helperText={
                            password !== passwordRepeat
                              ? "The passwords are diferent"
                              : ""
                          }
                        />
                      </Grid>
                    )}
                    <Grid container>
                      <FormHelperText error={error?.origin === "email"}>
                        {error?.origin === "email" && error?.message}
                      </FormHelperText>
                    </Grid>
                    <Grid container className={classes.centrado}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleLoginEmail}
                        className={classes.button}
                      >
                        {isLogin ? "Login" : "Register"}
                      </Button>
                    </Grid>
                    {isLogin && (
                      <Grid container style={{  margin: 'auto',  padding: 0, }}>
                        <Typography
                          onClick={() => setForgotPassword(true)}
                          className={classes.labels}
                          variant="body2"
                        >
                          Forgot your password?
                        </Typography>
                      </Grid>
                    )}
                    <Grid container>
                      <Typography
                        className={classes.labels}
                        variant="body2"
                        onClick={handleChangeLoginRegister}
                      >
                        {isLogin
                          ? "Register as admin"
                          : "Login to your account"}
                      </Typography>
                    </Grid>
                  </Grid>
                </>
              ) : <ForgotPassword close={setForgotPassword} />
                : (
                  <>
                    <Grid container>
                      <Typography variant="subtitle1" className={classes.centrado}>
                        Login with Email
                      </Typography>
                    </Grid>
                    <Grid container>
                      <Grid item  className={classes.centrado}>
                        <TextField
                          label="Your email addres"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          className={classes.centrado}
                        />
                      </Grid>
                      <Grid container>
                        <TextField
                          label="Your password"
                          value={password}
                          type="password"
                          onChange={(event) => setPassword(event.target.value)}
                          className={classes.centrado}
                        />
                      </Grid>
                      <Grid container>
                        <FormHelperText error={error?.origin === "email"}>
                          {error?.origin === "email" && error?.message}
                        </FormHelperText>
                      </Grid>
                      <Grid container className={classes.centrado}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleLoginEmail}
                          className={classes.button}
                        >
                          Login
                        </Button>
                      </Grid>
                      <Grid container justify-content="center">
                        <Typography
                          onClick={() => setForgotPassword(true)}
                          className={classes.labels}
                          variant="body2"
                        >
                          Forgot your password?
                        </Typography>
                      </Grid>
                    </Grid>
                  </>
                )
              }
            </Paper>
            {userType === ROLE_PUBLISHER && !forgotPassword && (
              <Grid
                container
                justify-content="center"
                className={classes.publisherProviderButtons}
              >
                <Grid item className={classes.googleButtonContainer}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleLoginProvider(PROVIDER_GOOGLE)}
                    className={classes.googleButton}
                  >
                    <GoogleLogo />
                    &nbsp; Login with Google
                  </Button>
                </Grid>
                <Grid container>
                  <Grid container item xs={10} justify-content="flex-end">
                    <Grid container item xs={12} justify-content="center">
                      <FormHelperText
                        error={
                          error?.origin === PROVIDER_GOOGLE ||
                          error?.origin === PROVIDER_FACEBOOK
                        }
                      >
                        {error?.origin !== "email" && error?.message}
                      </FormHelperText>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            )
            }
          </Grid>
        </Grid>
      </ThemeProvider>
      </div>
    </ThemeProvider>
  );
};

export default Login;
