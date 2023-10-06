import { useRef } from "react";
import PropTypes from "prop-types";
import { Button } from "@material-ui/core";
import { SpinnerButton } from "../Loaded/Spinner";

const LoadingButton = (
  { loading, done, handleFile, inputId, children, other } :
    { loading: boolean, done: boolean, handleFile: any, inputId: string, children: any, other: any }
  ) => {
  const hiddenFileInput = useRef(null);
  
  const handleClick = () => {
    const input: any = hiddenFileInput.current;
    input!.click();
  };

  if (done) {
    return <Button {...other} disabled></Button>;
  } else if (loading) {
    return (
      <Button {...other} disabled>
        Ask Credential
        <SpinnerButton />
      </Button>
    );
  } else {
    return (
        <>
          <input
            ref={hiddenFileInput}
            type="file"
            id={inputId}
            capture="environment"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFile}
          />
          <label htmlFor={inputId}>
            <Button {...other} onClick={handleClick}>
              {children}
            </Button>
          </label>
        </>
      )
  }
};

LoadingButton.defaultProps = {
  loading: false,
  done: false,
};

LoadingButton.propTypes = {
  loading: PropTypes.bool,
  done: PropTypes.bool,
};

export default LoadingButton;