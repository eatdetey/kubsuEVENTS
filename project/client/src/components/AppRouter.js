import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { authRoutes, publicRoutes } from '../routes';
import { Context } from '../index';
import { RequireRole } from '../utils/roles';

const AppRouter = observer(() => {
  const { user } = useContext(Context);

  const wrap = (Component, roles) => (roles
    ? <RequireRole roles={roles}><Component /></RequireRole>
    : <Component />);

  return (
    <Routes>
      {user.isAuth && authRoutes.map(({ path, Component, roles }) => (
        <Route key={path} path={path} element={wrap(Component, roles)} />
      ))}
      {publicRoutes.map(({ path, Component }) => (
        <Route key={path} path={path} element={<Component />} />
      ))}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
});

export default AppRouter;
