import { useState } from "react";
import { Link } from "react-router-dom";
import { Fab, Button, Grid } from "@material-ui/core";
import { useSelector, useDispatch } from "react-redux";
import toast from 'react-hot-toast';
import Field from "./Field";
import DinamycField from "./DinamycField";
import LoadingButton from "../Utils/LoadingButton";
import { createRequestToIssuer } from "../../services/apiHandler";
import apiService from '../../services/apiService';
import { useStyles } from "./styled";
import IconEdit from "../../Assets/svg/IconEdit";
import Check from "../../Assets/svg/Check";
import PendingDocument from "../../Assets/svg/PendingDocument";
import {
  credential_mobil,
  credential_email,
  credential_address,
  credential_birthday,
  LS_DID_KEY,
  BYTES_TO_MB,
  MAX_IMAGE_SIZE
} from "../../Const";

const Identity = () => {
  const classes: any = useStyles();
  const dispatchUserData = useDispatch();
  const [file,setFile] = useState(null);
  const name = useSelector((state: any) => state.store.name.value);
  const lastName = useSelector((state: any) => state.store.lastName.value);
  const dinamycFields = useSelector((state: any) => state.store.dynamicFields);
  const postal = useSelector(
    (state: any) => state.store[credential_address].value
  );
  const id = useSelector((state: any) => state.store[credential_address].id);
  const status = useSelector((state: any) => state.store[credential_address].status);
  const pending = useSelector((state: any) => state.store[credential_address].pending);
  const userId = localStorage.getItem(LS_DID_KEY);

  const credential = async (file: File) => {

    if (!postal.country) {
      return toast.error("Add a value to the identity");
    }

    console.log("image size", BYTES_TO_MB(file.size) + "mb")
    console.log("max image size", BYTES_TO_MB(MAX_IMAGE_SIZE) - 1 +"mb")


    if(file.size > MAX_IMAGE_SIZE){
      return toast.error(`The image should not be bigger than ${BYTES_TO_MB(MAX_IMAGE_SIZE)-1} mb`)
    }

    const formData = new FormData();
      
    try {
      formData.append("image", file);
      console.log('formData',formData.getAll("image"));

      const url = `/user/upload-image?userId=${userId}&credential_type=${credential_address}`
      const image = await apiService.post(url , formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('image',image)

      await createRequestToIssuer(credential_address, userId as string, image.data.image, postal.country);

    } catch(err) {
      console.log(err)
      return toast.error("Some error has occurred, please check your internet connection")
    }

    const payload = { id: `${id}`, value: postal, pending: true };

    dispatchUserData({
      type: "update",
      payload,
    });

    return toast.success("Request created, please wait until the data is validated");
  };

  const [stateIn, setState] = useState({
    loading: false,
    finished: false,
    credential,
  });

  const { loading, finished } = stateIn;

  const onClick = () => {
    setState({ ...stateIn, loading: true });

    setTimeout(() => {
      setState({ ...stateIn, loading: false });
    }, 1800);
  };

  const handleFile = (event: any) => {
    event.preventDefault()
    console.log('handleFile')
    const _file = event.target.files[0];
    console.log(event.target.files)
    console.log(_file)
    if(!_file){
      return toast.error("You need to upload a document to verify the information!");
    }
    setFile(_file);
    onClick();
    credential(_file);
  }

  return (
    <>
      <div className={classes.root}>
        <h1 className={classes.titleH1}>Personal</h1>
        <div className={classes.contentPersonal}>
          <Fab
            component={Link}
            to="/identity/edit/name"
            color="secondary"
            aria-label="edit"
            className={classes.fab}
          >
            <IconEdit />
          </Fab>
          <div>
            <p className={classes.titleName}>Give Name</p>

            <h1 className={classes.name}>{name || "---"}</h1>

            <p className={classes.titleName}>Family Name</p>
            <h1 className={classes.name}>{lastName || "---"}</h1>
          </div>
        </div>

        <div>
          <h1 className={classes.titleH1}>Contact</h1>
          <Field
            to="/identity/edit/email"
            path={credential_email}
            title="Email"
            field="email"
          />
          <Field
            to="/identity/edit/mobile"
            path={credential_mobil}
            title="Mobile Phone"
            field="mobile"
          />
          <Field
            to="/identity/edit/datebirth"
            path={credential_birthday}
            title="Date Birth"
            field="birthday"
          />

          <div className={classes.contentPersonal}>
            <Fab
              component={Link}
              to="/identity/edit/postal"
              color="secondary"
              aria-label="edit"
              className={classes.fab}
            >
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
                <p className={classes.titleName}>Postal Address</p>
                <Link
                  to="/identity/edit/postal"
                  style={{ textDecoration: "none" }}
                >
                  <h1 className={classes.name}>
                    {postal.address || <span className={classes.add}>+ add</span>}
                  </h1>
                </Link>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                {
                  pending ? (
                    <div className={classes.check}>
                      <PendingDocument />
                    </div>
                  ) : status ? (
                    <div className={classes.check}>
                      <Check />
                    </div>
                  ): (
                    <LoadingButton
                      loading={loading}
                      done={finished}
                      other={{
                        className: classes.button,
                        variant: "contained",
                        color: "primary",
                        type: "submit",
                      }}
                      handleFile={handleFile}
                      inputId={credential_address}
                    >
                      Ask for credential
                    </LoadingButton>
                  )
                }
              </div>
            </div>
          </div>

          {dinamycFields.map((values: any, index: number) => {
            return <DinamycField values={values} index={index} key={index} />;
          })}
        </div>
        <Grid container item xs justifyContent="center">
          <Link to="/identity/add/field">
            <Button
              className={classes.button}
              variant="contained"
              color="primary"
              type="submit"
            >
              ADD
            </Button>
          </Link>
        </Grid>
      </div>
    </>
  );
};
export default Identity;
