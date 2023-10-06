import React, { RefObject } from "react";
import { StateProvider, ObjectWatcher } from "reenhance-components";
import {  CircularProgress, Grid, makeStyles } from "@material-ui/core";
const LoadedState: any = StateProvider(false);
const ImageRefWatcher: any = ObjectWatcher(React.createRef(), 'current');

const useStyles = makeStyles((theme) => ({
  spinnerContainer: {
    marginTop: theme.spacing(4),
  },
}));

const DefaultLoader = () => {
  const classes = useStyles();

  return (
    <Grid container justify-content="center" className={classes.spinnerContainer}>
      <Grid item>
        <CircularProgress />
      </Grid>
    </Grid>
  )
}

const ImageWithLoading = ({ src, alt, className, Loader }: any) => (
  
  <LoadedState>
    {({ state: loaded, setState: setLoaded }: any) => (
      <ImageRefWatcher watch="current">
        {(imageRef: any) => {
          const complete = imageRef.current && imageRef.current.complete;
          return (
            <div>
              {!complete ? 
                  Loader? 
                    <Loader/> 
                  : 
                    <DefaultLoader/> 
                : 
                  null
              }
              <img
                src={src}
                style={!complete ? { visibility: 'hidden' } : {}}
                ref={imageRef as RefObject<HTMLImageElement>}
                alt={alt || ""}
                className={className || ""}
                onLoad={() => setLoaded(true)}
                />
            </div>
          );
        }}
      </ImageRefWatcher>
    )}
  </LoadedState>

);

export default ImageWithLoading