// This is used to determine if a user is authenticated and
// if they are allowed to visit the page they navigated to.

// If they are: they proceed to the page
// If not: they are redirected to the login page.
import React, { ReactElement, useContext } from "react";
import { Redirect, Route } from "react-router-dom";
import AppContext from "./AppContext";

const PrivateRoute = ({
  component: Component,
  routeForAdmins = false,
  allowedRoles,
  exact,
  path,
  ...rest
  } : {
    component: any
    routeForAdmins?: boolean,
    allowedRoles: Array<string>,
    exact: boolean
    path: string,
  }) => {
  const { isUserAuthed, userRole } = useContext(AppContext);
  return (
    <Route
      {...rest}
      exact={exact}
      path={path}
      render={(props) =>
        isUserAuthed && allowedRoles.includes(userRole) ? (
          <Component {...props} {...rest} />
        ) : (
          <Redirect to="/auth" />
        )
      }
    />
  );
};

export default PrivateRoute;
