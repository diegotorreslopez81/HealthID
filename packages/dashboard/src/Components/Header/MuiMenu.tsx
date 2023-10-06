import * as React from "react";
import Menu from "@material-ui/core/Menu";

const MuiMenu = React.forwardRef((props: any, ref) => {
  const { open }: { open: boolean } = props;
  return <Menu ref={ref} {...props} open={open} />;
});

export default MuiMenu;
