import { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Fab } from "@material-ui/core";
import toast from 'react-hot-toast';
import { createRequestToIssuer } from "../../services/apiHandler";
import apiService from '../../services/apiService';
import LoadingButton from "../Utils/LoadingButton";
import { useStyles } from "./styled";
import { LS_DID_KEY, BYTES_TO_MB, MAX_IMAGE_SIZE } from "../../Const";
import IconEdit from "../../Assets/svg/IconEdit";
import Check from "../../Assets/svg/Check";
import PendingDocument from "../../Assets/svg/PendingDocument";

export default function DinamycField({ values, index }: any) {
  const classes: any = useStyles();
  const [file, setFile] = useState(null);
  const dispatchUserData = useDispatch();
  const userId = localStorage.getItem(LS_DID_KEY);
  const status = useSelector((state: any) => state.store.dynamicFields[index].status);
  const pending = useSelector((state: any) => state.store.dynamicFields[index].pending);

  const credential = async (file: File) => {
    if(!values.value){
      return toast.error("Add a value to the identity");
    }
    const formData = new FormData();

    if (file.size > MAX_IMAGE_SIZE) {
      return toast.error(
        `The image should not be bigger than ${BYTES_TO_MB(MAX_IMAGE_SIZE)-1} mb`);
    }
      
    try{
      formData.append("image", file);
      console.log('formData', formData.getAll("image"));
      const url = `/user/upload-image?userId=${userId}&credential_type=${values.id}`
      const image = await apiService.post(url , formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('image',image)
      await createRequestToIssuer(values.id, userId as string, image.data.image, values.value);
    } catch(err) {
      console.log(err)
      return toast.error("Some error has occurred, please check your internet connection");
    }
    const payload = { value: `${values.value}`, id: `${values.id}`, status:false, pending:true };
    
    dispatchUserData({
      type: "update-dynamic-field",
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
      toast.error("You need to upload a document to verify the information!");
      return undefined;
    }
    setFile(_file);
    onClick();
    credential(_file);
  }

  return (
    <div className={classes.contentPersonal} key={index}>
      <Fab
        component={Link}
        to={`/identity/edit/field/${values.id}`}
        color="secondary"
        aria-label="edit"
        className={classes.fab}
      >
        <IconEdit />
      </Fab>
      <div style={{ flexGrow: 1, marginLeft: "1px" }}>
        <p className={classes.titleName}>{values.id}</p>
        <h1 className={classes.name}>{values.value}</h1>
      </div>
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
              variant: "contained",
              color: "primary",
              type: "submit",
              className: classes.button,
            }}
            handleFile={handleFile as VoidFunction}
            inputId={values.id}
          >
            Ask for credential
          </LoadingButton>
        )
      }
    </div>
  );
}
