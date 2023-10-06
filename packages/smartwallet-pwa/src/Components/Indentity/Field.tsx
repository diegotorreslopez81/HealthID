import { useState } from "react";
import { Fab } from "@material-ui/core";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import toast from 'react-hot-toast';
import { useStyles } from "./styled";
import apiService from '../../services/apiService';
import { createRequestToIssuer } from "../../services/apiHandler";
import IconEdit from "../../Assets/svg/IconEdit";
import Check from "../../Assets/svg/Check";
import PendingDocument from "../../Assets/svg/PendingDocument";
import LoadingButton from "../Utils/LoadingButton";
import { LS_DID_KEY , BYTES_TO_MB, MAX_IMAGE_SIZE} from "../../Const";

export default function Field({ to, path, title }: any) {
  const [file, setFile] = useState(null);
  const state = useSelector((state: any) => state.UserReducer[path].value);
  const id = useSelector((state: any) => state.UserReducer[path].id);
  const status = useSelector((state: any) => state.UserReducer[path].status);
  const pending = useSelector((state: any) => state.UserReducer[path].pending);
  const userId = localStorage.getItem(LS_DID_KEY);
  const dispatchUserData = useDispatch();
  const classes: any = useStyles();

  const credential = async (file: File) => {
    if (state !== "") {

      const payload = { id: `${id}`, value: `${state}`, pending:true };

      const credential_type = `${id}`

      try{
        if(file.size > MAX_IMAGE_SIZE){
          return toast.error(`The image should not be bigger than ${BYTES_TO_MB(MAX_IMAGE_SIZE)-1} mb`);
        }
        const formData = new FormData();
        
        formData.append("image", file);
        const url = `/user/upload-image?userId=${userId}&credential_type=${credential_type}`
        console.log('formData',formData.getAll("image"));
        const image = await apiService.post(url , formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        console.log('image', image)
        await createRequestToIssuer(credential_type, userId as string, image.data.image, state);
      } catch(err) {
        console.log(err)
        return toast.error("Some error has occurred, please check your internet connection")
      }

      dispatchUserData({
        type: "update",
        payload,
      });
    
      return toast.success("Request created, please wait until the data is validated")
    
    } else {
      toast.error("Add a value to the identity");
    }
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
      <div className={classes.contentPersonal}>
        <Fab
          component={Link}
          to={to}
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
            <p className={classes.titleName}>{title}</p>
            <Link
              to={to}
              className={classes.link}
              style={{ textDecoration: "none" }}
            >
              <h1 className={classes.name}>
                {state || <span className={classes.add}>+ add</span>}
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
                  inputId={id}
                >
                  Ask for credential
                </LoadingButton>
              )
            }
          </div>
        </div>
      </div>
    </>
  );
}
