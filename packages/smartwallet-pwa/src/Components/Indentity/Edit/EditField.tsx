import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import { Container, TextField, Button } from "@material-ui/core";
import toast from 'react-hot-toast';
import { useStyles } from "./style";
import ArrowLeft from "../../../Assets/svg/ArrowLeft";

const EditField = () => {
  const dynamycFields = useSelector((state: any) => state.UserReducer.dynamicFields);
  const classes = useStyles();
  const history = useHistory();
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const dispatchUserData = useDispatch();
  const { fieldId }: any = useParams();

  const field = dynamycFields.find((field: any) => field.id === fieldId);
  console.log(field);

  const handleClick = (event: any) => {
    event.preventDefault();
    console.log(title);
    if (field.value === value) {
      toast("No changes have been made", {
        duration: 2000,
      });
    } else {
      dispatchUserData({
        type: "update-dynamic-field",
        payload: {
          value,
          id: title.toString(),
          status: false, 
          pending:false
        },
      });
      setTimeout(() => {
        return history.push("/identity");
      }, 500);
      toast.success("Has been added successfully", {
        duration: 2000,
      });
    }
  };
  useEffect(() => {
    setTitle(field.id);
    setValue(field.value);
  }, [field.id, field.value]);

  const handleReturn = () => {
    if (history.length <= 2) {
      history.push("/identity");
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
          background: "#272727",
          fontWeight: 500,
        }}
      >
        <Container className={classes.root}>
          <div onClick={handleReturn} className={classes.return}>
            <ArrowLeft /> <p style={{ marginLeft: "15px" }}>Return</p>{" "}
          </div>
          <h1 className={classes.title}>Edit</h1>
          <form className={classes.root} noValidate autoComplete="off">
            <TextField
              style={{ marginTop: "20px" }}
              InputProps={{
                className: classes.input,
              }}
              id="standard-secondary"
              label="Data Name"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
            <br />
            <TextField
              style={{ marginTop: "20px" }}
              InputProps={{
                className: classes.input,
              }}
              id="standard-secondary"
              label="Value"
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
            <br />
          </form>
          <Button
            onClick={handleClick}
            className={classes.buttonBlue}
            variant="contained"
            color="primary"
            type="submit"
          >
            SAVE
          </Button>
        </Container>
      </div>
    </>
  );
};
export default EditField;
