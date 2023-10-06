import { useEffect, useState, useContext } from 'react';
import { 
	Grid,
	Typography,
	Button,
	IconButton,
	Card,
	CardActions,
	CardMedia,
	CardContent,
	makeStyles
} from '@material-ui/core';
import toast from 'react-hot-toast';
import ImageWithLoading from "../../ImageWithLoading";
import apiService from "../../../Services/apiService";
import AppContext from "../../../AppContext";
import { CREDENTIAL_SUPPORT_ZKP } from "../../../Constants";
import ArrowLeft from "../../../Assets/svg/ArrowLeft";

const useStyles = makeStyles(() => ({
  media: {
    width: '100%',
  },
}));

const Request = ({match, history}: any) => {

	const [request, setRequest] = useState<any>("");
	const { socket } = useContext(AppContext);
	const classes = useStyles();

	const update = async () => {
		const id = match.params.id
		if(!id){
			return setRequest(null);
		}
		try{
			const response = await apiService.get(`/issuer/unique-request?id=${id}`)
			setRequest(response.data)
		}catch(err){
			console.log(err)
			toast.error(
				"Error fetching updated data",
			);
			setRequest(null)
		}
	}

	useEffect(() => {
		update()
	},[]);

	const approve = async () => {
		toast("Approving, please wait");
		let signedCredentials = {};
		let w3cCredential: any = {};

		try{
			w3cCredential = await apiService.post('/issuer/w3c-sign',{requestId:request._id});
			signedCredentials = w3cCredential.data;
			
			console.log('w3c result',w3cCredential.data);
			
			if(CREDENTIAL_SUPPORT_ZKP.includes(request.credential)){
				const zkpCredential = await apiService.post('/issuer/zkp-sign',{requestId:request._id});
				
				console.log('zkp result',zkpCredential.data);
				
				signedCredentials = {...signedCredentials,zkp:{...zkpCredential.data.userData}}
			}
	
			console.log('signedCredentials', signedCredentials)
		}catch(err){
			console.log(err)
			let message = 'Error signing credentials';
			return toast.error(message);
		}
		
		try{
			
			const result = await apiService.post('/issuer/approve-credential',{
				_id: request._id,
				signedCredentials
			})
			
			toast.success("Credential successfully approved");
			socket!.current!.emit('changedCredentialRequestStatus', result.data.request);
			update()
		
		}catch(err: any){
			console.log(err)
			update()
			let message = 'Error updating credential request status';
			if(err.message.endsWith("400")){
				message = "This credential request already has been approved or declined"
			}
			toast.error(message);
		}
	}

	const decline = async () => {
		try{
			const result = await apiService.post('/issuer/decline-credential',{_id: request._id})
			socket!.current!.emit('changedCredentialRequestStatus', result.data.request);
			toast.success("Credential successfully declined");
			update()
		}catch(err: any){
			console.log(err.message)
			update() 
			let message = 'Error updating credential request status';
			if(err.message.endsWith("400")){
				message = "This credential request already has been approved or declined"
			}
			toast.error(message);
		}
	}

	const handleReturn = () => {
		history.push('/issuer')
	}

	return (
		<Grid container justify-content='center' item xs={12}>
			<Grid container justify-content='flex-start' item xs={12}>
				<IconButton 
					aria-label="return"
					component="span"
					onClick={handleReturn}
				>
					<ArrowLeft/> return	
				</IconButton>
			</Grid>
			<Grid container justify-content='center' item xs={12} sm={8}>
				{
					request == null? 
						<Grid item xs={12}>
							<Typography variant='h5'>
								This credential request does not exist
							</Typography>
						</Grid>
					: !request?
						<Grid item xs={12}>
							<Typography variant='h6'>
								...Loading
							</Typography>
						</Grid>
					:(
						<Card>
							<CardMedia>
								<ImageWithLoading
									src={request.data} 
									alt="document"
									className={classes.media}
								/>
							</CardMedia>
							<CardContent>
								<Typography align='center' gutterBottom variant="h5" component="h2">
									Certificate {request.credential.replace("credential_","")}
								</Typography>
								<Typography align='center' variant="h6" component="p">
									claim: {request.claim}
								</Typography>
								<Typography align='center' variant="h6" component="p">
									status: {request.status}
								</Typography>
							</CardContent>
							{
								request.status == "pending" &&
								<CardActions>
									<Grid container justify-content="center">
										<Button 
											variant='contained' 
											color='primary'
											onClick={decline}
										>
											decline
										</Button>
									</Grid>
									<Grid container justify-content="center" >
										<Button 
											variant='contained' 
											color='primary'
											onClick={approve}
										>
											approve
										</Button>
									</Grid>
								</CardActions>
							}
						</Card>
					)
				}
			</Grid>
		</Grid>
	)
}
export default Request