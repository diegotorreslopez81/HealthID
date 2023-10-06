import * as React from "react";
import MenuItem from "@material-ui/core/MenuItem";

const MuiMenuItem = React.forwardRef((props: { children: any, onClick: VoidFunction }, ref: any) => {
  return <MenuItem ref={ref} {...props} />;
});

export default MuiMenuItem;
