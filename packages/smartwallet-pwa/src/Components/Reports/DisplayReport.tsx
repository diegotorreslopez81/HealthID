import { useSelector } from "react-redux";
import { Container } from "@material-ui/core";
import { useHistory } from "react-router";
import toast from 'react-hot-toast';
import { useStyles } from "./styled";
import ArrowLeft from "../../Assets/svg/ArrowLeft";
import Editor from "../Utils/Editor";
import { useParams } from "react-router-dom";

const DisplayReport = () => {
  const classes: any = useStyles();
  const history = useHistory();
  const { credentialId }: { credentialId: string } = useParams();
  const report = useSelector(
    (state: any) => {
      state.store.lastName.value
      const reports: any[] = state.store.reports;
      const report = reports.find(
        (val) => val?.credential?.credentialSubject?.credential?.id === credentialId
      );
      return report
    }
  );

  const handleReturn = () => {
    if (history.length <= 2) {
      history.push("/reports");
    } else {
      history.goBack();
    }
  };

  return (
    <>
      <div
        style={{
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
        <Container className={classes.root}>
          <div onClick={handleReturn} className={classes.return}>
            <ArrowLeft stroke="black" /> <p style={{ marginLeft: "15px" }}>Return</p>
          </div>
          <h1 className={classes.title}>Report</h1>
          <div className={classes.root}>
            <div style={{ width: "100%" }} >
              <Editor
                defaultData={report.content}
              />
            </div>
          </div>
        </Container>
      </div>
    </>
  );
};
export default DisplayReport;