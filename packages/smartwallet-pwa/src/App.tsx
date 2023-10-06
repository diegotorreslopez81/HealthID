import { useEffect, lazy, Suspense, useState, useRef, MutableRefObject } from "react";
import {
  Route,
  Switch,
  useLocation,
  useHistory,
  Redirect,
} from "react-router-dom";
import { useDispatch } from "react-redux";
import io, { Socket } from "socket.io-client";
import didMethod from 'did-method-generic';
import { makeStyles } from "@material-ui/core/styles";
import PWAPrompt from 'react-ios-pwa-prompt'
import toast from 'react-hot-toast';
import Badge from "@material-ui/core/Badge";
import Header from "./Components/Header";
import BackupQuestions from './Components/BackupQuestions';
import SwUpdater from "./SwUpdater";
import Spinner from "./Components/Loaded/Spinner";
import Article from "./Components/Article";
import {
  NOT_DISPAY_HEADER_IN,
  LS_USER_KEY,
  LS_DID_KEY,
  initialState,
} from "./Const";
import { updateCredential, getPendingResponses } from './services/SocketUtils';
import { ContextProvider } from "./AppContext";
import "./App.css";
import { DefaultEventsMap } from "socket.io-client/build/typed-events";

const useStyles = makeStyles((theme) => ({
  root: {
    "& > *": {
      margin: theme.spacing(2),
      background: "#f50057",
      color: "#fff",
      borderRadius: "9999px",
      padding: "0px 15px",
      fontSize: "1.4rem",
      right: "0",
      marginTop: "20px",
      zIndex: "10",
      position: "fixed",
      fontWeight: 700,
    },
  },
  lowConnection: {
    "& > *": {
      margin: theme.spacing(2),
      background: "#ff9800",
      color: "#fff",
      borderRadius: "9999px",
      padding: "0px 15px",
      fontSize: "1.4rem",
      right: "0",
      marginTop: "20px",
      zIndex: "10",
      position: "fixed",
      fontWeight: 700,
    },
  },
}));

const ReactLazyPreload = (importStatement: any) => {
  
  const Component = lazy(importStatement);
  return {
    Component,
    preload: importStatement
  };
};

const EditField = ReactLazyPreload(() =>
  import("./Components/Indentity/Edit/EditField")
  );
  const DemoEmail = ReactLazyPreload(() =>
  import("./Components/Documents/Demo/DemoEmail")
  );
  const DemoPostal = ReactLazyPreload(() =>
  import("./Components/Documents/Demo/DemoPostal")
  );
  const DemoDateBirth = ReactLazyPreload(() =>
  import("./Components/Documents/Demo/DemoDateBirth")
  );
  const DemoDinamycs = ReactLazyPreload(() =>
  import("./Components/Documents/Demo/DemoDinamycs")
  );
  const EditAdd = ReactLazyPreload(() =>
  import("./Components/Indentity/Edit/Add")
  );
  const Identity = ReactLazyPreload(() =>
  import("./Components/Indentity/Indentity")
  );
  const Documents = ReactLazyPreload(() => import("./Components/Documents"));
  const Settings = ReactLazyPreload(() =>
  import("./Components/Settings/Settings")
  );
  const ImportBackup = ReactLazyPreload(() =>
  import("./Components/Settings/ImportBackup")
  );
  const Scan = ReactLazyPreload(() => import("./Components/Scan"));
  const DemoMobile = ReactLazyPreload(() =>
  import("./Components/Documents/Demo/DemoMobile")
  );
  const EditName = ReactLazyPreload(() =>
  import("./Components/Indentity/Edit/EditName")
);
const EditEmail = ReactLazyPreload(() =>
import("./Components/Indentity/Edit/EditEmail")
);
const EditMobile = ReactLazyPreload(() =>
import("./Components/Indentity/Edit/EditMobile")
);
const EditPostal = ReactLazyPreload(() =>
import("./Components/Indentity/Edit/EditPostal")
);
const EditDateBirth = ReactLazyPreload(() =>
import("./Components/Indentity/Edit/EditDateBirth")
);

function useOnlineStatus() {
  const [online, setOnline] = useState(window.navigator.onLine);
  
  useEffect(() => {
    function handleOnline() {
      setOnline(true);
    }
    
    function handleOffline() {
      setOnline(false);
    }
    
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);
  
  return online;
}

function App() {
  const online = useOnlineStatus();
  const location = useLocation();
  const dispatch = useDispatch();
  const history = useHistory();
  const classes = useStyles();
  const credentialSocketRef: MutableRefObject<Socket<DefaultEventsMap, DefaultEventsMap> | undefined> = useRef();
  const svc = [
    {
      "id": "#linkedin",
      "type": "linkedin",
      "serviceEndpoint": "https://www.linkedin.com/company/infinitelabs-co"
    },
    {
      "id": "#gitlab",
      "type": "gitlab",
      "serviceEndpoint": "https://gitlab.com/infinite-labs"
    }
  ]
  const didHandler  = didMethod.driver({method:'healthid',service:svc})
  
  
  useEffect(() => {
    history.listen((location: any, action: any) => {
      // check for sw updates on page change
      navigator.serviceWorker
      .getRegistrations()
      .then((regs) => regs.forEach((reg) => reg.update()));
    });
  }, [history]);
  
  const handleUpdateServiceWorker = () => {
    navigator.serviceWorker.getRegistrations().then((regs) =>
      regs.forEach((reg) => {
        reg!.waiting!.postMessage({ type: "SKIP_WAITING" });
      })
      );
    };
    
    useEffect(() => {
      if (online === false) {
        toast.error("No internet connection", {
          duration: 6000,
        });
        toast("Refresh the browser when the connection returns", {
          duration: 6000,
        });
      }
    }, [online]);
    
  useEffect(() => {
    const userId = localStorage.getItem(LS_DID_KEY);
    if (!userId) {
      const setUserId = async () => {
        let id = (await didHandler.generate()).id;
        localStorage.setItem(LS_DID_KEY, id);
      }
      setUserId()
    }
    const lsData = localStorage.getItem(LS_USER_KEY);
    if (!lsData) {
      const parsedState = JSON.stringify(initialState);
      localStorage.setItem(LS_USER_KEY, parsedState);
    }
  }, []);

  useEffect(() => {
    const lsData = JSON.parse(localStorage.getItem(LS_USER_KEY as string) as string);
    if (lsData) {
      dispatch({
        payload: lsData,
        type: "load_store_data",
      });
    }
  }, [dispatch]);


  useEffect(() => {
    credentialSocketRef.current = io(import.meta.env.VITE_MONCON_URL_SOCKET as string);
    credentialSocketRef.current.on("connect", () => {
      console.log(credentialSocketRef.current!.id);
      let userId = localStorage.getItem(LS_DID_KEY);
      if (!userId) {
        return
      }
      credentialSocketRef.current!.emit('subscribeToCredentialRequestStatus',{userId});
      credentialSocketRef.current!.on("updateCredentialStatus", async (data) => {
        console.log("updateCredential event")
        await updateCredential(data, credentialSocketRef as MutableRefObject<Socket<DefaultEventsMap, DefaultEventsMap>>, dispatch)
      });
    });
    console.log('updateCredential useEffect')
    return () => {
      credentialSocketRef.current!.on("disconnect", async () => {
        console.log("disconnect");
        credentialSocketRef.current!.off("updateCredentialStatus", async (data: any) => {
          await updateCredential(data, credentialSocketRef as MutableRefObject<Socket<DefaultEventsMap, DefaultEventsMap>>, dispatch)
        });
      });
    };
  }, [credentialSocketRef, updateCredential]);

  useEffect(() => {
    let userId = localStorage.getItem(LS_DID_KEY);
    if (!userId) {
      return
    }
    console.log('getPendingResponses useEffect')
    const f = async () =>{
      await getPendingResponses(userId as string, credentialSocketRef as MutableRefObject<Socket<DefaultEventsMap, DefaultEventsMap>>, dispatch)
    }
    f();

  }, []);

  return (
    <div>
      <div id="new-updates">
        <SwUpdater onClick={handleUpdateServiceWorker} />
      </div>

      <div className={classes.root}>
        {online === false && (
          <Badge>
            <span>Offline</span>
          </Badge>
        )}
      </div>

      <Switch>
        <ContextProvider
          value={{
            EditName,
            EditEmail,
            EditMobile,
            EditPostal,
            EditAdd,
            socket: credentialSocketRef,
          }}
        >
          <Redirect to="/identity" />

          <Route exact path="/identity">
            <Suspense fallback={<Spinner />}>
              <Identity.Component />
            </Suspense>
          </Route>

          <Route exact path="/identity/edit/name">
            <Suspense fallback={<Spinner />}>
              <EditName.Component />
            </Suspense>
          </Route>

          <Route exact path="/identity/edit/email">
            <Suspense fallback={<Spinner />}>
              <EditEmail.Component />
            </Suspense>
          </Route>

          <Route exact path="/identity/edit/mobile">
            <Suspense fallback={<Spinner />}>
              <EditMobile.Component />
            </Suspense>
          </Route>

          <Route exact path="/identity/edit/postal">
            <Suspense fallback={<Spinner />}>
              <EditPostal.Component />
            </Suspense>
          </Route>

          <Route exact path="/identity/edit/datebirth">
            <Suspense fallback={<Spinner />}>
              <EditDateBirth.Component />
            </Suspense>
          </Route>

          <Route exact path="/identity/add/field">
            <Suspense fallback={<Spinner />}>
              <EditAdd.Component />
            </Suspense>
          </Route>

          <Route exact path="/credentials">
            <Suspense fallback={<Spinner />}>
              <Documents.Component />
            </Suspense>
          </Route>

          <Route exact path="/scan">
            <Suspense fallback={<Spinner />}>
              <Scan.Component />
            </Suspense>
          </Route>

          <Route exact path="/articles">
            <Suspense fallback={<Spinner />}>
              <Article />
            </Suspense>
          </Route>

          <Route exact path="/settings">
            <Suspense fallback={<Spinner />}>
              <Settings.Component />
            </Suspense>
          </Route>

          <Route exact path="/settings/import-backup">
            <Suspense fallback={<Spinner />}>
              <ImportBackup.Component />
            </Suspense>
          </Route>

          <Route path="/identity/edit/field/:fieldId">
            <Suspense fallback={<Spinner />}>
              <EditField.Component />
            </Suspense>
          </Route>

          <Route path="/documents/demo/field/:fieldId">
            <Suspense fallback={<Spinner />}>
              <DemoDinamycs.Component />
            </Suspense>
          </Route>

          <Route path="/documents/demo/email">
            <Suspense fallback={<Spinner />}>
              <DemoEmail.Component />
            </Suspense>
          </Route>

          <Route exact path="/documents/demo/mobile">
            <Suspense fallback={<Spinner />}>
              <DemoMobile.Component />
            </Suspense>
          </Route>

          <Route exact path="/documents/demo/datebirth">
            <Suspense fallback={<Spinner />}>
              <DemoDateBirth.Component />
            </Suspense>
          </Route>

          <Route exact path="/documents/demo/postal">
            <Suspense fallback={<Spinner />}>
              <DemoPostal.Component />
            </Suspense>
          </Route>
        </ContextProvider>
      </Switch>
      <PWAPrompt />
      {!NOT_DISPAY_HEADER_IN.includes(location.pathname) && <Header />}
      <BackupQuestions/>
    </div>
  );
}

export default App;
