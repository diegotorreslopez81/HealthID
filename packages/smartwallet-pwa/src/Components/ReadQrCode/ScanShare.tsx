import { useEffect } from "react";
import { Fab, Container, Typography } from "@material-ui/core";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import toast from 'react-hot-toast';
import { useStyles } from "./style";
import { createProof } from "../../services/zkpService.js";
import { LS_DID_KEY } from "../../Const";
import Check from "../../Assets/svg/Check";
import IconEdit from "../../Assets/svg/IconEdit";
import MonconImg from "../../Assets/img/MonconImg";

const ScanShare = ({ QrResponse, socket, setCredential_verified }: any) => {
  const classes: any = useStyles();
  const history = useHistory();
  const dispatchArticles = useDispatch();

  const handleDeny = () => {
    toast.error("Deny", {
      duration: 3000,
    });
    return handleReturn();
  };

  const handleReturn = () => {
    if (history.length <= 2) {
      history.push("/identity");
    } else {
      history.goBack();
    }
  };

  useEffect(() => {
    const localSocketRef = socket.current;
    
    const validatedCredentialResponse = (data: any) => {
      if (data.validated) {
        toast.success("Credential validated", {
          duration: 3000,
        });

        if (QrResponse.type === "request_credential") {
          const { url, image, title } = QrResponse.content;
          dispatchArticles({
            type: "add-articles",
            payload: { url, image, title },
          });
          return history.push("/articles");
        }

        return setCredential_verified(true);
      } else {
        toast.error("Credential is not valid", {
          duration: 3000,
        });
        return handleReturn();
      }
    };

    localSocketRef.on(
      "validatedCredentialResponse",
      validatedCredentialResponse
    );

    return () => {
      localSocketRef.off(
        "validatedCredentialResponse",
        validatedCredentialResponse
      );
    };
  }, [socket]);

  const handleClick = async () => {
    let data = QrResponse;
    const credential = JSON.parse(localStorage.getItem(data.request) as string);
    const userId = localStorage.getItem(LS_DID_KEY);
    if (!credential) {
      if (import.meta.env.NODE_ENV === "development") {
        console.log("data.request in ScanShare in handleClick", data.request);
      }
      toast.error("Credential does not exist", {
        duration: 3000,
      });
      return handleReturn();
    }

    data.idUser = socket.current.id;
    data.userId = userId;
    console.log(credential)

    if(data.content.verification_type==='w3c'){
      data.credential = {"my-vc": credential['my-vc']}
    }

    else if(data.content.verification_type==='zkp'){
      const {
        aggregated_credentials, 
        issuer_public_key,
        keys
      } = credential.zkp;

      const proof = await createProof(
        aggregated_credentials,
        keys,
        issuer_public_key
      )

      data.credential = proof
    }

    data.issuer_did = credential.issuer_did

    if (import.meta.env.NODE_ENV === "development") {
      console.log("Sending credential in ScanShare in line 93", data);
    }
    socket.current.emit("webCredentialRequest", data);

    toast.success("Credential sent, waiting for response, this could take some time", {
        duration: 3000,
      }
    );
  };

  return (
    <>
      <Container>
        <h1 className={classes.titleH1}>Service</h1>
        <div style={{ marginTop: "15px" }}>
          <div className={classes.serviceContainerWhite}>
            <div className={classes.fabWhite}>
              <MonconImg />
            </div>
            <div>
              <Typography
                variant="body1"
                className={classes.serviceSubtitleBlack}
              >
                {QrResponse.hostname}
              </Typography>
            </div>
          </div>
        </div>

        <h1 className={classes.titleH1}>
          This service is asking you to share the following claims:
        </h1>
        <div className={classes.contentPersonal}>
          <Fab color="secondary" aria-label="edit" className={classes.fab}>
            <IconEdit />
          </Fab>
          <div
            style={{
              flexGrow: 1,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              alignItems: "center",
            }}
          >
            <div>
              <p className={classes.titleName}>{QrResponse.request}</p>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginRight: "20px",
              }}
            >
              <div className={classes.check}>
                <Check />
              </div>
            </div>
          </div>
        </div>

        <div className={classes.appBar}>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div className={classes.buttonBlue} onClick={handleClick}>
              SEND CREDENTIAL
            </div>
            <div className={classes.buttonBlack} onClick={handleDeny}>
              {" "}
              DENY
            </div>
          </div>
        </div>
      </Container>
    </>
  );
};
export default ScanShare;
