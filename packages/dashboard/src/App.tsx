import { useEffect, useState, useRef, MutableRefObject } from "react";
import { Redirect, Route, Switch, useLocation } from "react-router-dom";
import { Container, makeStyles } from "@material-ui/core";
import io, { Socket } from "socket.io-client";
import { Toaster } from 'react-hot-toast';
import { auth } from "./Services/firebaseService";
import PrivateRoute from "./PrivateRoute";
import Issuer from "./Components/Issuer";
import Request from "./Components/Issuer/UserRequest/Request"
import Header from "./Components/Header";
import Admin from "./Components/Admin";
import Login from "./Components/Login";
import Spinner from "./Components/Spinner/Spinner";
import AppContext from "./AppContext";
import { getRoleFromUserClaims } from "./Services/utilsService";
import {
  ROLES_DEFAULT_ROUTES,
  ROLE_ADMIN,
  ROLE_ISSUER,
  LS_KEY_TOKEN,
} from "./Constants";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: 50,
    [theme.breakpoints.down("xs")]: {
      padding: 10,
    },
  },
}));

function App() {
  const classes = useStyles();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isUserAuthed, setIsUserAuthed] = useState<boolean>();
  const [userRole, setUserRole] = useState("");
  const [userId, setUserId] = useState("");
  const [userPhoto, setUserPhoto] = useState("");
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const socket: MutableRefObject<Socket<any, any> | undefined> = useRef();


  useEffect(() => {
    const removeListener = auth.onAuthStateChanged((user: any) => {
      setIsLoading(true);
      if (user) {
        setIsUserAuthed(true);
        user.getIdTokenResult().then((tokenData: any) => {
          console.log('getting role');
          setUserRole(getRoleFromUserClaims(tokenData.claims));
          localStorage.setItem(LS_KEY_TOKEN, tokenData.token);
          setUserId(tokenData.claims.user_id);
          setUserPhoto(tokenData.claims.picture);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      removeListener();
    };
  }, []);

  const logout = () => {
    auth.signOut();
    setIsUserAuthed(false);
    setUserRole("");
    localStorage.removeItem(LS_KEY_TOKEN);
  };

  const redirectPath = ROLES_DEFAULT_ROUTES[userRole] || "/auth";

  useEffect(() => {
    const setSocket = () => {
      socket.current = io(import.meta.env.VITE_MONCON_URL_SOCKET);
      socket.current.on("connect", () => {
        console.log(socket.current!.id);
        setIsSocketConnected(true);
      });
      socket.current.on('connect_error', function() {
        console.log('Connection Failed');
        setSocket();
      });
    };

    setSocket();

    return () => {
      socket.current!.on("disconnect", () => {
        console.log("disconnect");
        setIsSocketConnected(false);
      });
    };
  }, []);

  return isLoading ? (
    <Spinner open={true} />
  ) : (
    <AppContext.Provider
      value={{
        isUserAuthed: Boolean(isUserAuthed),
        userRole,
        userId,
        userPhoto,
        setUserRole,
        setIsLoading,
        logout,
        isSocketConnected,
        socket: socket,
      }}
    >
      {location.pathname !== "/auth" && (
        <Header />
      )}
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 2000,
          error: {
            duration: 5000,
          },
        }}
      />
      <div className={classes.root}>
        <Container>
          <Switch>
            <Route exact path="/auth" component={Login} />
            <PrivateRoute
              exact
              path="/admin"
              component={Admin}
              allowedRoles={[ROLE_ADMIN]}
            />
            <PrivateRoute
              exact
              path="/issuer"
              component={Issuer}
              allowedRoles={[ROLE_ISSUER]}
            />
            <PrivateRoute
              exact
              path="/issuer/request/:id"
              component={Request}
              allowedRoles={[ROLE_ISSUER]}
            />
            <Redirect to={redirectPath} />
          </Switch>
        </Container>
      </div>
    </AppContext.Provider>
  );
}

export default App;
