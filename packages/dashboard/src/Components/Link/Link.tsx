import * as React from "react";
import { Link as RouterLink } from "@material-ui/core";
const Link = ({ children, to, target, className, ...other }: { children: any, to: string, target?: string | undefined, className?: string | undefined }) => {
  const internal = /^\/(?!\/)/.test(to);

  if (internal) {
    return (
      <RouterLink href={to} className={className} {...other}>
        {children}
      </RouterLink>
    );
  }

  return (
    <a href={to} target={target} className={className} {...other}>
      {children}
    </a>
  );
};

export default Link;
