import { useSelector } from "react-redux";
import { Grid, Typography, Avatar, Button } from "@material-ui/core";
import toast from 'react-hot-toast';
import { useStyles } from "./styled";
import IconDocuments from "../../Assets/svg/IconDocuments";
import { truncate } from "../../Const";
import { useHistory } from "react-router-dom";

const Reports = () => {
  const classes: any = useStyles();
  const reports = useSelector((state: any) => state.store.reports);
  const history = useHistory();

  const openReport = async (report: any) => {
    history.push(`/report/${report?.credential?.credentialSubject?.credential?.id}`);
  };
  const openCredential = async (report: any) => {
    history.push(`/report/credential/${report?.credential?.credentialSubject?.credential?.id}`);
  };

  return !!reports?.length ? (
    <>
      <div className={classes.titleHistory}>Reports</div>
      {reports.map((report: any) => (
        <Grid
          container
          className={classes.root}
          justifyContent="center"
          key={report?.credential?.credentialSubject?.credential?.id}
          component="div"
        >
          <Grid
            container
            item
            xs={12}
            sm={11}
            md={9}
            lg={8}
            className={classes.cardContainer}
            alignItems="center"
          >
            <Grid item xs={2} sm={1}>
              {!!report?.img ? (
                <Avatar
                  variant="square"
                  src={report.img}
                  className={classes.cardImage}
                />
              ) : (
                <div className={classes.imageFallback}>
                  <IconDocuments
                    height={"4em"}
                    width={"3.5em"}
                    color={"#1c1c1c"}
                  />
                </div>
              )}
            </Grid>
            <Grid container justifyContent="flex-start" item xs={5}>
              <Typography className={classes.previewtitle} variant="h5">
                Report created by {truncate(report.issuer_did, 10)}
              </Typography>
            </Grid>
            <Grid container justifyContent="flex-end" item xs={5}>
              <Button
                className={classes.historyLink}
                onClick={() => openCredential(report)}
              >
                open credential
              </Button>
              <Button
                className={classes.historyLink}
                onClick={() => openReport(report)}
              >
                open report
              </Button>
            </Grid>
          </Grid>
        </Grid>
      ))}
    </>
  ) : (
    <div
      style={{
        alignItems: "center",
        display: "flex",
        justifyContent: "center",
        textAlign: "center",
        position: "absolute",
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        color: "rgba(0, 0, 0, 0.6)",
        fontSize: "20px",
        fontWeight: 500,
      }}
    >
      There are no medical reports yet
    </div>
  );
};
export default Reports;
