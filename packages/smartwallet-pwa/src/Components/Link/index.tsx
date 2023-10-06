import * as React from "react";
import { Link as RouterLink } from "@material-ui/core";
const Link = ({ children, to, target="_self", className, ...other }: { children: any, to: string, target?: string, className?: string }) => {
  const internal = /^\/(?!\/)/.test(to);

  if (internal) {
    return (
      <RouterLink href={to} target={target} className={className} {...other}>
        {children}
      </RouterLink>
    );
  }

  return (
    <a href={to} {...other}>
      {children}
    </a>
  );
};

export default Link;
