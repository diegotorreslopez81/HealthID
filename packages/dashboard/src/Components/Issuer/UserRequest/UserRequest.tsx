import { useHistory } from "react-router-dom";
import {
	Grid,
	Typography,
	List,
	ListItem,
	ListItemText,
	makeStyles,
	withStyles
} from '@material-ui/core';
import MuiAccordion from '@material-ui/core/Accordion';
import MuiAccordionSummary from '@material-ui/core/AccordionSummary';
import MuiAccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const Accordion = withStyles({
	root: {
		border: '1px solid rgba(0, 0, 0, .125)',
		boxShadow: 'none',
		'&:not(:last-child)': {
			borderBottom: 0,
		},
		'&:before': {
			display: 'none',
		},
		'&$expanded': {
			margin: 'auto',
		},
	},
	expanded: {},
})(MuiAccordion);

const AccordionSummary = withStyles({
	root: {
		borderBottom: '1px solid rgba(0, 0, 0, .125)',
		marginBottom: -1,
		minHeight: 56,
		'&$expanded': {
			minHeight: 56,
		},
	},
	content: {
		'&$expanded': {
			margin: '12px 0',
		},
	},
	expanded: {},
})(MuiAccordionSummary);

const AccordionDetails = withStyles((theme) => ({
	root: {
		padding: theme.spacing(2),
	},
}))(MuiAccordionDetails);

const useStyles = makeStyles(() => ({
	margin: {
		marginTop: 20,
		marginBottom: 40,
	},
	listItem: {
		cursor: 'pointer'
	},
}));

const UserRequest = ({ user }: any) => {
	const classes = useStyles();
	const history = useHistory();

	const handleClick = (id: string | number) => {
		return history.push(`/issuer/request/${id}`);
	}

	return (
		<Grid
			container
			justify-content='center'
			spacing={3}
			className={classes.margin}
		>
			<Accordion>
				<AccordionSummary expandIcon={<ExpandMoreIcon />}>
					<Typography variant='h5'>
						user : {user?.userId}
					</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<List>
						{
							user?.request.map((request: any, index: number) => (
								<>
									<ListItem
										className={classes.listItem}
										onClick={() => handleClick(request._id)}
										key={index}
									>
										<ListItemText primary={`${index + 1}. Certificate ${request.credential.replace("credential_", "")}`} />
									</ListItem>
									{
										index < user.request.length - 1 && <hr />
									}
								</>
							)
							)
						}
					</List>
				</AccordionDetails>
			</Accordion>
		</Grid>
	)
}
export default UserRequest
