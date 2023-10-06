import { useEffect, useState, useRef, useContext } from "react";
import { Grid, makeStyles } from "@material-ui/core";
import QRCodeStyling, { Options } from "qr-code-styling";
import SectionTitle from "../SectionTitle";
import AppContext from "../../AppContext";
import toast from "react-hot-toast";

const useStyles = makeStyles(() => ({
  marginBottom: {
    marginBottom: 20,
  },
}));

const QrCode = () => {
  const { socket, userId } = useContext(AppContext);
  const [socketResponse, setSocketResponse] = useState<any>({});
  const [options, setOptions] = useState<Options>({
    width: 300,
    height: 300,
    type: "svg",
    data: JSON.stringify({
      idProvider: socket?.current?.id,
    }),
    image:
      "https://pbs.twimg.com/profile_images/1356260647642796035/qPlwhss9_400x400.jpg",
    dotsOptions: { type: "classy", color: "#6a1a4c" },
    cornersSquareOptions: { type: "extra-rounded", color: "#000000" },
    backgroundOptions: {
      color: "#e9ebee",
    },
    imageOptions: {
      crossOrigin: "anonymous",
      margin: 20,
    },
  })
  const [qrCode] = useState<QRCodeStyling>(new QRCodeStyling(options));
  const ref = useRef<HTMLDivElement>(null);
  const classes: any = useStyles();
  console.log({ idProvider: socket?.current?.id });

  useEffect(() => {
    const handshake = (data: any) => {
      console.log(data)
      const newData = { ...socketResponse, data };
      setSocketResponse(newData);
      toast("initiating handshake");
      socket?.current?.emit("finishHandshake", { ...newData, issuerId: userId });
    };

    if(!!socket?.current){ 
      socket.current.on(
        "handshake",
        handshake
      );
    }

    return () => {
      socket?.current?.off(
        "handshake",
        handshake
      );
    };
  }, [socket]);

  useEffect(() => {
    let data = JSON.parse(options?.data as string);
    if (data.idProvider !== socket?.current?.id) {
      data.idProvider = socket?.current?.id;
      console.log({ idProvider: socket?.current?.id });
      setOptions({ ...options, data: JSON.stringify(data) });
    }
  }, [socket]);

  useEffect(() => {
    if (ref.current) {
      qrCode.append(ref.current);
    }
  }, [ref, qrCode]);

  useEffect(() => {
    if (!qrCode) return;
    qrCode.update(options);
  }, [qrCode, options]);

  return (
    <>
      <SectionTitle title="QrCode" />
      <Grid container spacing={3} className={classes.marginBottom}>
      </Grid>
      <div ref={ref}></div>
    </>
  );
};

export default QrCode;