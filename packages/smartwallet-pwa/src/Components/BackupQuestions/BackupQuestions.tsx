import { useState, useEffect } from 'react'; 
import { 
	Dialog,
	DialogContent,
	Grid,
	Typography,
	TextField,
	FormHelperText,
	Button,
	makeStyles
} from '@material-ui/core';
import toast from 'react-hot-toast';
import { LS_KEY_PAIR, LS_DID_KEY, LS_PBKDF_KEY } from "../../Const";
import apiService from "../../services/apiService";
import CloseIcon from "../../Assets/svg/CloseIcon";

const useStyles = makeStyles(theme => ({
  root: {
    bottom: "0",
    left: "0",
    right: "0",
    top: "0",
    position: "fixed",
    opacity: '3'
  },

  button: {
    margin: "20px 0px",
    borderRadius: "4px",
    fontSize: "11px",
    fontWeight: 600,
    padding: "12px 31px 14px",
    background: "rgb(25, 25, 25)",
    color: "#fff",
    "&:hover": {
      backgroundColor: "rgba(51,51,51,1)",
      boxShadow: "none",
    },
  },
  margin: {
    marginTop: 10,
    marginBottom: 20,
  },
  close: {
    position: 'absolute',
    cursor: 'pointer',
    marginTop: '8px',
  }
}));

const Close = ({ handleReturn } : { handleReturn: VoidFunction }) => {
	const classes = useStyles();
	const [width,setWidth] = useState(0);

	const getDialogWidth = () => {
    const newWidth = document.getElementById("DialogPaper")?.clientWidth

    if(!newWidth) return;

    setWidth(newWidth);
  };

  // Get 'width' and 'height' after the initial render and every time the list changes
  useEffect(() => {
    getDialogWidth();
  }, []);

  // Update 'width' and 'height' when the window resizes
  useEffect(() => {
    window.addEventListener("resize", getDialogWidth);

    return () => {
			window.removeEventListener("resize", getDialogWidth);    	
    }
  }, []);

  return (
		<div
			onClick={handleReturn}
			className={classes.close}
			style={{
				marginLeft: `${width - 32}px`
			}}
		>
			<CloseIcon/>
		</div>
  )
  
}

const BackupQuestions = () => {
	const classes = useStyles();
	const [showDialog,setShowDialog] = useState(!localStorage.hasOwnProperty(LS_KEY_PAIR))
	const [questions, setQuestions] = useState<[string, unknown][]>();
	const [inputData, setInputData] = useState<{[question: string]: string}>({
		"question1":"",
		"question2":"",
		"question3":"",
		"question4":"",
		"question5":""
	});
	const [pbkdf,setPbkdf] = useState(
		localStorage.getItem(LS_PBKDF_KEY)? 
			JSON.parse(localStorage.getItem(LS_PBKDF_KEY as string) as string).key_derivation
		:
			null
	);
	const userData = { id: localStorage.getItem(LS_DID_KEY) };
	const inputProps = {
		style:{
			fontSize: "1.5rem",
		},
		autoComplete: 'off'
	}
	const inputLabelProps = {
		style:{
			fontSize: "1.5rem",
		}
	}

	useEffect(() => {
		const getQuestions = async () => {
			let response = { data : {} };
			try {
				response =  await apiService.get('/user/backup-questions');
				console.log(response);
			} catch(err) {
				console.log(err);
				toast.error("Error fetching questions");
			}

			const arrayOfData = Object.entries(response!.data);

			setQuestions(arrayOfData);
		}
		if (showDialog && !questions) {
			getQuestions();
		}

	},[showDialog]);

	useEffect(() => {
		const generatePBKDF = async () => {
			let response = {
				data: {
					pbkdf: {
						key_derivation: ''
					}
				}
			};
			try{
				response =  await apiService.post('/user/pbkdf', { userData });
				console.log(response.data);
				setPbkdf(response.data.pbkdf.key_derivation);
				localStorage.setItem(LS_PBKDF_KEY,JSON.stringify(response.data.pbkdf));
			} catch(err) {
				console.log(err);
				toast.error("Error generating PBKDF");
			}
		}

		if(showDialog && !!questions && !pbkdf){
			generatePBKDF()
		}
	}, [showDialog, questions]);


	const handleChange = (question: any) => (e: any) => {
		setInputData((questions) => ({ ...questions, [question]: e.target.value }));
	};

  const createKeys = async () => {
		let response = {
			data : {},
		};
		let answers: {[question: string]: string} = {};
		const keys = Object.keys(inputData);
		let numOfAnswers = 0;
		keys.forEach((question) => {
			if (inputData[question].trim()) {
				numOfAnswers++;	
			}
			answers[question] = inputData[question].trim() || "null";
		});

		if (numOfAnswers !== 3) {
			return toast.error("You should answer 3 questions");
		}
		if (!pbkdf) {
			return toast.error("Error, theres no PBKDF");
		}
		try {
			response = await apiService.post("/user/keypair",{
				pbkdf,
				answers
			})
			localStorage.setItem(
				LS_KEY_PAIR,
				window.btoa(JSON.stringify(response.data)),
			);
			setShowDialog(false);
		} catch(err) {
			console.log(err)
			toast.error("Error generating the keypair")
		}
	}

	const handleReturn = () => {
		setShowDialog(false);
	}

	return (
		<>
			<Dialog
				className={classes.root}
				open={showDialog && !!questions}
				fullWidth={true}
				maxWidth="md"
				aria-labelledby="form-dialog-title"
				PaperProps={{
					style: { 
						borderRadius: 20,
						margin: 0,
						width: "calc(110% - 64px)",
						maxHeight: "calc(85% - 64px)", 
					},
					id: "DialogPaper",
				}}
				BackdropProps={{ 
					style: { backgroundColor: "transparent" } 
				}}
			>
				
				<Close handleReturn={handleReturn}/>

				<DialogContent>
					<Typography variant="h2" >
						You need to answer the following questions 
					</Typography>
					<br/>
					<Typography variant="h3" >
						Answer only 3 questions
					</Typography>
					<br/>
					<Typography variant="h4">
						this data will be used to generate a private key, that will be used to encrypt your backups
					</Typography>
					<Grid 
						container
						justifyContent='center'
						spacing={3}
						className={classes.margin}
					>
						{
							questions && questions.map((question) => (
								<Grid 
									container
									justifyContent='center'
									item 
									xs={12}
									key={question[0]}
								>
									<FormHelperText style={{
										fontSize: "1.5rem",
										marginBottom:"-5px",
										textAlign: "center"
									}}>
                    {question[1]}
                  </FormHelperText>
									<TextField
										id={question[0]}
										value={inputData[question[0]]}
										onChange={handleChange(question[0])}
										fullWidth
										InputLabelProps={inputLabelProps}
										InputProps={inputProps}
									/>
								</Grid>
							))
						}
					</Grid>
					<Typography variant="h4">
						you will also need this public key to recover your private key, 
					</Typography>
					<Grid 
						container
						justifyContent='center'
						spacing={3}
						className={classes.margin}
					>
						<Grid 
							container
							justifyContent='center'
							item 
							xs={12}
						>
							<TextField
								label={"PBKDF"}
								value={pbkdf || 'generating PBKDF'}
								fullWidth
								multiline
								InputLabelProps={inputLabelProps}
								InputProps={inputProps}
								onChange={() => pbkdf || 'generating PBKDF'}
							/>
						</Grid>

					</Grid>
					<Grid 
						container
						justifyContent='center'
						spacing={3}
						className={classes.margin}
					>
						<Grid 
							container
							justifyContent='center'
							item 
							xs={12}
						>
							<Button 
								variant='contained' 
								color='primary'
								className={classes.button}
								onClick={createKeys}
							>
								continue
							</Button>

						</Grid>
					</Grid>
				</DialogContent>
			</Dialog>
		</>
	)
}

export default BackupQuestions;