import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Container, Button, TextField, Grid, Typography, FormHelperText } from "@material-ui/core";
import { useHistory } from "react-router";
import toast from 'react-hot-toast';
import apiService from "../../services/apiService";
import { useStyles } from "./styled";
import ArrowLeft from "../../Assets/svg/ArrowLeft";
import { decrypt } from "../../services/backupService" ;

const ImportBackup = () => {
  const classes: any = useStyles();
  const history = useHistory();
  const [pbkdf, setPbkdf] = useState<any>({})
  const [questions, setQuestions] = useState<any>(null);
  const [inputData, setInputData] = useState<{ [question: string]: string }>({
    "question1":"",
    "question2":"",
    "question3":"",
    "question4":"",
    "question5":""
  });
  const dispatchUserData = useDispatch();

  useEffect(() => {
    const getQuestions = async () => {
      let response: any = {};
      try {
        response =  await apiService.get('/user/backup-questions');
        console.log(response)
      } catch(err: any) {
        console.log(err)
        toast.error("Error fetching questions")
      }

      const arrayOfData = Object.entries(response.data);

      setQuestions(arrayOfData);
    }
    getQuestions();
  },[]);

  const handleReturn = () => {
    if (history.length <= 2) {
      history.push("/settings");
    } else {
      history.goBack();
    }
  };

  const handleChange = (question: string) => (e: any) => {
    setInputData((questions) => ({ ...questions, [question]: e.target.value }));
  };

  const handleClick = async (event: any) => {
    event.preventDefault();

    if(!pbkdf){
      toast.error('You need to submit the info');
      return
    }

    let response: any = {};
    let answers: any = {};
    let decryptionKeys: any = {}
    const keys = Object.keys(inputData);
    let numOfAnswers = 0;

    keys.forEach((question) => {
      if(inputData[question].trim()){
        numOfAnswers++; 
      }
      answers[question] = inputData[question].trim() || "null";
    });

    if(numOfAnswers !== 3){
      return toast.error("You should answer 3 questions");
    }

    if(!pbkdf){
      return toast.error("Error, theres no PBKDF");
    }

    try{
      console.log(pbkdf)
      response = await apiService.post("/user/keypair",{
        pbkdf: pbkdf.key_derivation,
        answers
      })
      decryptionKeys = response.data;
    } catch(err){
      console.log(err)
      return toast.error("Error re-generating the keypair");
    }

    let data: any = {};
    let encryptedData: any = {};
    console.log(decryptionKeys.keypair.public_key)
    try {
      data = (await apiService.post("/user/get-backup",{public_key: decryptionKeys.keypair.public_key})).data;
      encryptedData = data.result.backup;
    } catch(err: any) {
      console.log(err);
      return toast.error("Error finding the backup");
    }

    let decryptedData: any = {}
    try {
      const decrypResult = await decrypt(JSON.parse(encryptedData), decryptionKeys)
      console.log(decrypResult)
      decryptedData = JSON.parse(decrypResult);
    } catch(err: any) {
      console.log(err)
      return toast.error("Incorrect PBKDF");
    }

    if(!decryptedData){
      return toast.error("Incorrect PBKDF");
    }

    console.log('dispatching')
    dispatchUserData({type:'import', payload: decryptedData});

    handleReturn();
  };

  const handlePBKDF = async (event: any) => {
    const file = await event.currentTarget.files[0].text();

    setPbkdf(JSON.parse(file));
  }

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
          height: "120%",
        }}
      >
        <Container className={classes.mnemonicRoot}>
          <div onClick={handleReturn} className={classes.mnemonicReturn}>
            <ArrowLeft /> <p style={{ marginLeft: "15px" }}>Return</p>
          </div>
          <Typography color='secondary' variant='h1' className={classes.title}>
            Import Backup
          </Typography>
          <form 
            className={classes.mnemonicRoot}
            noValidate 
            autoComplete="off"
          >
            <br />
            <Grid container item xs={12} justifyContent='center'>
              <Grid container item xs={12} justifyContent='center'>
                <Button
                  component="label"
                  className={classes.mnemonicButtonBlue}
                  variant="contained"
                  color="primary"
                >
                  <Grid container item xs={12} justifyContent='center'>

                    <Grid container item xs={12} justifyContent='center'>
                      <Typography 
                        variant='body1'
                        className={classes.uploadImageLabel} 
                        display='inline'
                      >
                        Upload PBKDF
                      </Typography>
                    </Grid> 
                  </Grid> 
                  <input
                    onChange={handlePBKDF}
                    type="file"
                    accept='.json'
                    hidden
                  />
                </Button>
              </Grid>
            </Grid>
              <Grid 
              container
              justifyContent='center'
              spacing={3}
              className={classes.margin}
            >
              {
                questions && questions.map((question: any) => (
                  <Grid 
                    container
                    justifyContent='center'
                    item 
                    xs={10}
                    key={question[0]}
                  >
                    <FormHelperText style={{
                        color:"#e0e0e0",
                        fontSize: "1.5rem",
                        marginBottom:"-5px",
                        textAlign:"center",
                      }}
                    >
                      {question[1]}
                    </FormHelperText>
                    <TextField
                      id={question[0]}
                      value={inputData[question[0]]}
                      onChange={handleChange(question[0])}
                      fullWidth
                      InputProps={{
                        style:{
                          color:"#fff",
                          fontSize: "1.8rem",
                        },
                      }}
                    />
                  </Grid>
                ))
              }
            </Grid>
            <Button
              onClick={handleClick}
              className={classes.mnemonicButtonBlue}
              variant="contained"
              color="primary"
              type="submit"
              disabled={!(Object.keys(pbkdf).length > 0)}
              style={{
                marginBottom: "100px"
              }}
            >
              Continue
            </Button>
          </form>
        </Container>
      </div>
    </>
  );
};
export default ImportBackup;
