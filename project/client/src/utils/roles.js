import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Context } from '..';
import { ROLE_HIERARCHY, LOGIN_ROUTE, EVENT_ROUTE } from './consts';

// Hook — returns true if the authenticated user has any of the listed roles.
export const useHasRole = (...allowedRoles) => {
  const { user } = useContext(Context);
  if (!user.isAuth) return false;
  return allowedRoles.includes(user.role);
};

// Hook — true if the authenticated user is at least minRole in the hierarchy.
export const useHasMinRole = (minRole) => {
  const { user } = useContext(Context);
  if (!user.isAuth) return false;
  const min = ROLE_HIERARCHY[minRole];
  const have = ROLE_HIERARCHY[user.role];
  return have !== undefined && have >= min;
};

// Route guard — wrap a page element to enforce a role requirement.
// Use either `roles={[ROLES.MOD, ROLES.ADMIN]}` or `minRole={ROLES.EDITOR}`.
// Unauthenticated callers are redirected to login; authenticated but
// under-privileged callers are sent home.
export const RequireRole = observer(({
  roles,
  minRole,
  children,
  unauthRedirect = LOGIN_ROUTE,
  forbiddenRedirect = EVENT_ROUTE,
}) => {
  const { user } = useContext(Context);
  if (!user.isAuth) return <Navigate to={unauthRedirect} replace />;
  let allowed;
  if (roles) {
    allowed = roles.includes(user.role);
  } else if (minRole) {
    const have = ROLE_HIERARCHY[user.role];
    const min = ROLE_HIERARCHY[minRole];
    allowed = have !== undefined && min !== undefined && have >= min;
  } else {
    allowed = true;
  }
  if (!allowed) return <Navigate to={forbiddenRedirect} replace />;
  return children;
});
