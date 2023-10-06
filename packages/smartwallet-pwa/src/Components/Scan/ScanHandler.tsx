import { useState, useEffect } from "react";
import { useHistory } from "react-router";
import toast from 'react-hot-toast';
import { LS_USER_KEY, LS_DID_KEY } from "../../Const";
import ReadQrCode from "../ReadQrCode";
import ScanShare from "../ReadQrCode/ScanShare";
import Spinner from '../Loaded/Spinner';

const ScanHandler = ({ socket, display }: any) => {
  const [QrScan, setQrScan] = useState(false);
  const [QrResponse, setQrResponse] = useState<any>({});
  const [hideQrReader, setHideQrReader] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
  const [QrType, setQrType] = useState("");
  const [loader, setLoader] = useState(false);
  const history = useHistory();

  useEffect(() => {
    if (Object.keys(QrResponse).length > 0) {
      //indicates that the scanner output has data
      setQrScan(true);
      //hide the qr scanner
      setHideQrReader(true);
    }
  }, [QrResponse]);

  useEffect(() => {
    if (QrScan) {
      //set the type of action
      setQrType(QrResponse.type);
    }
  }, [QrResponse]);

  useEffect(() => {
    if (QrScan && !!QrResponse.content) {
      //check if the content is already purcharsed
      const userInfo = JSON.parse(localStorage.getItem(LS_USER_KEY) as string);
      const articles = userInfo.articles;
      const match = articles.find(
        (article: any) => article.url === QrResponse.content.url
      );
      if (!match) {
        return;
      }
      const userId = localStorage.getItem(LS_DID_KEY);
      const data = {
        idProvider: QrResponse.idProvider,
        idUser: socket.current.id,
        userId,
      };

      if (import.meta.env.NODE_ENV == "development") {
        console.log("ScanHandler");
        console.log("emit login data", data);
      }

      //if the content is purchased emit an event with the user id
      //to the page to check it in the backend and keep or hide the paywall
      socket.current.emit("login", data);

      setIsPurchased(true);

      toast.success("the content is already purchased", {
        duration: 3000,
      });
      return history.push("/articles");
    }
  }, [QrResponse]);

  useEffect(() => {
    if (QrScan) {
      if (!QrResponse.request) {
        return;
      }
      if (QrResponse.type == "payment") {
        return;
      }
      const credential = JSON.parse(localStorage.getItem(QrResponse.request) as string);
      if (!credential) {
        if (import.meta.env.NODE_ENV == "development") {
          console.log(
            "data.request in ScanHandler in useEffect",
            QrResponse.request
          );
        }
        toast.error("Credential does not exist", {
          duration: 3000,
        });
        return history.push("/identity");
      }
    }
  }, [QrScan, QrResponse]);

  useEffect(() => {
    const handshake = (data: any) => {
      console.log(data)
      toast("stablishing secure channel");
      //check zkp
      //handle case that zkp is valid
      if (true) {
        // add documents or other data to this object
        socket?.current?.emit("finishHandshake", { ...QrResponse, documents: "imagine this is a record" });
      }
      //handle case that zkp is invalid
    };
    if (QrResponse) {
      if(!!socket?.current){ 
        socket.current.on(
          "endHandshake",
          handshake
        );
      }

    }


    return () => {
      socket?.current?.off(
        "endHandshake",
        handshake
      );
    };
  }, [socket, QrResponse]);

  const getContentInfo = (qrdata: any) => {
    setQrResponse(qrdata);
    const userId = localStorage.getItem(LS_DID_KEY);
    const data = {...qrdata, userId, idUser: socket.current.id, message: "hello, I'm a debuging message" };
    console.log(data);
    socket.current.emit("initHandshake", data);
    toast("fetching info about the content", {
      duration: 3000,
    });
    return setLoader(true);
  }

  return (
    <>
      {display && !hideQrReader && (
        <ReadQrCode
          setQrResponse={getContentInfo}
          QrScan={QrScan}
        />
      )}

      {loader && <Spinner/> }

      {
        QrScan && !isPurchased && !loader &&
          {
            request_credential: (
              <ScanShare QrResponse={QrResponse} socket={socket} />
            ),
          }[QrType]
      }
    </>
  );
};
export default ScanHandler;
