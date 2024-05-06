import { Grid, Typography } from "@material-ui/core";
import toast from 'react-hot-toast';
import QrReader from "react-qr-reader";
import { useStyles } from "./style";
import { useHistory } from "react-router-dom";
import IconLeft from "../../Assets/svg/IconLeft";

const ReadQRCode = ({ setQrResponse, QrScan }: { setQrResponse: any, QrScan: any }) => {
  const classes: any = useStyles();
  const history = useHistory();
  //this is the delay between each scan
  const delay = 400;

  const handleError = (err: Error) => {
    toast.error(err.message, {
      duration: 3000,
    });
  };

  const handleReturn = () => {
    if (history.length <= 2) {
      history.push("/documents");
    } else {
      history.goBack();
    }
  };

  const handleScan = (data: any) => {
    try {
      if (data) {
        if (import.meta.env.NODE_ENV === "development") {
          console.log("raw data", data);
        }
        const dataParse = JSON.parse(data);
        if (import.meta.env.NODE_ENV === "development") {
          console.log("parsed data", dataParse);
        }

        return setQrResponse(dataParse);
      }
    } catch (error: any) {
      console.log(error.message);
      toast.error(error.message, {
        duration: 3000,
      });
      setQrResponse({});
    }
  };

  return (
    <>
      <Grid container justifyContent="center" className={classes.root}>
        <Grid
          container
          justifyContent="center"
          style={{ background: "#272727 !important" }}
        >
          {!QrScan && (
            <>
              <div className={classes.contentMenu}>
                <div
                  onClick={handleReturn}
                  style={{
                    marginTop: "18px",
                    marginRight: "12px",
                    cursor: "pointer",
                  }}
                >
                  <IconLeft />
                </div>

                <h1 style={{ color: "#ffff", fontSize: "2.2rem" }}>
                  Scan QR code
                </h1>
              </div>
              <Grid
                container
                justifyContent="center"
                className={classes.contentMenu_2}
              >
                <Typography
                  style={{
                    color: "#ffff",
                    fontSize: "2.2rem",
                    fontWeight: "normal",
                  }}
                >
                  To use HealthId Wallet go to the web to unlock on your computer
                </Typography>
              </Grid>
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  paddingTop: "70em",
                  background: "#272727 !important",
                }}
              >
                <QrReader
                  delay={delay}
                  className={classes.previewStyle}
                  onError={handleError}
                  onScan={handleScan}
                  facingMode="environment"
                />
              </div>
            </>
          )}
        </Grid>
      </Grid>
    </>
  );
};

export default ReadQRCode;
