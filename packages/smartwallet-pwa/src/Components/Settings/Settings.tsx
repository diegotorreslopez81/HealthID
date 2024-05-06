import { useState, useEffect } from "react";
import { useHistory } from "react-router";
import { Fab, Grid } from "@material-ui/core";
import toast from 'react-hot-toast';
import { saveAs } from 'file-saver';
import { useStyles } from "./styled";
import IconSecurity from "../../Assets/svg/IconSecurity";
import IconMail from "../../Assets/svg/IconMail";
import IconPrivacy from "../../Assets/svg/IconPrivacy";
import Link from "../Link";
import IconWeb from "../../Assets/svg/IconWeb";
import IconSpeaker from "../../Assets/svg/IconSpeaker";
import apiService from "../../services/apiService";
import { encrypt, getDataFromLS } from "../../services/backupService";
import { LS_KEY_PAIR, LS_PBKDF_KEY } from "../../Const";

const Settings = () => {
  const classes = useStyles();
  const history = useHistory();

  const generateBackUp = async () => {
    const data = getDataFromLS()

    const base64Keypair = localStorage.getItem(LS_KEY_PAIR);

    const keypair = JSON.parse(window.atob(base64Keypair as string));

    const encryptedData = await encrypt(data, keypair.keyring);

    const PBKDF = JSON.parse(localStorage.getItem(LS_PBKDF_KEY) as string);

    const keypairBlob = new Blob(
      [
        JSON.stringify(PBKDF, null, 4)
      ],
      {
        type: 'application/json'
      }
    );

    try {
      const response = await apiService.post("/user/update-backup", {
        public_key: keypair.ecdh_public_key,
        backup: JSON.stringify(encryptedData),
      });
      console.log(response);
    } catch (err: any) {
      console.log(err);
      return toast.error("Error creating backup", {
        duration: 2000,
      })
    }

    saveAs(keypairBlob, "healthId_wallet_pbkdf.json");

    return;
  }

  const importBackUp = () => {
    return history.push("/settings/import-backup")
  }

  return (
    <>
      <div className={classes.root}>
        <h1 className={classes.titleH1}>Security</h1>

        <div className={classes.contentWarning}>
          <Fab
            style={{ background: "#F1A008", marginLeft: "9px" }}
            aria-label="edit"
            className={classes.fab}
          >
            <IconSecurity />
          </Fab>
          <div>
            <h1 className={classes.titleSettings}>Backup Your Identity</h1>
            <Grid container spacing={8}>
              <Grid item xs={5}>
                <button
                  className={classes.buttonBlue}
                  onClick={() => importBackUp()}
                >
                  import
                </button>
              </Grid>
              <Grid item xs={5}>
                <button
                  className={classes.buttonBlue}
                  onClick={() => generateBackUp()}
                >
                  export
                </button>
              </Grid>
            </Grid>
          </div>
        </div>
        <div>
          <h1 className={classes.titleH1}>Contact</h1>
          <div className={classes.contentSetting}>
            <Link
              to={`mailto:hello@moncon.co`}
              style={{ textDecoration: "none" }}
            >
              <Fab color="secondary" aria-label="edit" className={classes.fab}>
                <IconMail />
              </Fab>
            </Link>
            <div>
              <h1 className={classes.titleSettings}>Send and email</h1>
            </div>
          </div>

          <div className={classes.contentSetting}>
            <Link
              to={`https://moncon.co`}
              target={"_blank"}
              style={{ textDecoration: "none" }}
            >
              <Fab color="secondary" aria-label="edit" className={classes.fab}>
                <IconWeb />
              </Fab>
            </Link>
            <div>
              <h1 className={classes.titleSettings}>Website</h1>
            </div>
          </div>

          <div className={classes.contentSetting}>
            <Link
              to={`https://moncon.co/privacy-policy/`}
              target={"_blank"}
              style={{ textDecoration: "none" }}
            >
              <Fab color="secondary" aria-label="edit" className={classes.fab}>
                <IconPrivacy />
              </Fab>
            </Link>
            <div>
              <h1 className={classes.titleSettings}>Privacy Policy</h1>
            </div>
          </div>

          <div className={classes.contentSetting}>
            <Link
              to={`https://moncon.co/terms-of-services/`}
              target={"_blank"}
              style={{ textDecoration: "none" }}
            >
              <Fab color="secondary" aria-label="edit" className={classes.fab}>
                <IconSpeaker />
              </Fab>
            </Link>
            <div>
              <h1 className={classes.titleSettings}>Terms of service</h1>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default Settings;
