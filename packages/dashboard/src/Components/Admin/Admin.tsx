import { useEffect, useState } from "react";
import apiService from "../../Services/apiService";
import {
  Avatar,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  TextField,
  Typography,
  Button,
  FormHelperText
} from "@material-ui/core";
import toast from 'react-hot-toast';
import SectionTitle from "../SectionTitle";

const useStyles: any = makeStyles((theme) =>({
  table: {
    minWidth: 650,
  },
  claimError: {
    backgroundColor: "red",
    color: "#fff",
    padding: 10,
  },

  root: {
    padding: 20,
  },
  texField: {
    marginLeft: 20,
  },
  button: {
    margin: 20,
    paddingRight: 85,
    paddingLeft: 85,
  },
  paper: {
    width: theme.spacing(40),
    borderRadius: 10,
    padding: "30px 0",
  },
}));

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const classes = useStyles();

  const getUsersData = () => {
    return apiService.get("/admin/users").then((response) => {
      setUsers(response.data);
    });
  }

  const createIssuer = async () => {
    setError('')
    if(!password.trim()){
      return setError('You need to enter a password')
    }
    if(!email.trim()){
      return setError('You need to enter a email')
    }
    
    const promise = apiService.post('/admin/create-issuer',{password, email});
    toast.promise(
      promise,
      {
        loading: "Creating issuer, please wait",
        success: "issuer created",
        error: "error creating issuer",
      },
      { 
        success: {
          duration: 5000,
        },
      }
    );
    const response = await promise;
    if(!response?.data?.success){
      console.log(response)
      return setError(response.data.error);
    }

    getUsersData();
  }

  useEffect(() => {
    getUsersData()
  }, []);

  return (
    <>
      <SectionTitle title="Admin Dashboard" />
      <Grid container spacing={3}>
        <TableContainer component={Paper}>
          <Table className={classes.table} size="small" aria-label="a dense table">
            <TableHead>
              <TableRow>
                <TableCell>Display Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Last Sign In</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Photo</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((row: any) => (
                <TableRow key={row.uid}>
                  <TableCell component="th" scope="row">
                    {row.displayName}
                  </TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{row.metadata.creationTime}</TableCell>
                  <TableCell>{row.metadata.lastSignInTime}</TableCell>
                  <TableCell>
                    {row.customClaims ? (
                      Object.keys(row.customClaims)[0]
                    ) : (
                      <span className={classes.claimError}>ERROR!</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Avatar alt={row.displayName} src={row.photoURL} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
      <Grid container spacing={3} justify-content="center" className={classes.root}>
        <SectionTitle title="Create Issuer Account" />
        <Grid container item xs={9} justify-content="center">
          <Paper className={classes.paper}>
              <Grid container>
                <TextField
                  label="Your email addres"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={classes.texField}
                />
              </Grid>
              <Grid container justify-content="center">
                <TextField
                  label="Your password"
                  value={password}
                  type="password"
                  onChange={(event) => setPassword(event.target.value)}
                  className={classes.texField}
                />
              </Grid>
              <Grid container justify-content="center">
                <FormHelperText error={Boolean(error)}>
                  {error || ''}
                </FormHelperText>
              </Grid>
              <Grid container justify-content="center">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={createIssuer}
                  className={classes.button}
                >
                  Create Issuer
                </Button>
              </Grid>
          </Paper>
        </Grid>
      </Grid>
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
    </>
  );
};

export default Admin;
