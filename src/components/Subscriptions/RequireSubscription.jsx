// components/RequireSubscription.jsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { Context } from "../context/Context"


const RequireSubscription = ({ children }) => {
  const { subscriptionStatus} = useContext(Context);


  if (!subscriptionStatus?.is_active) {
    return <Navigate to="/subscriptions" replace />;
  }

  return children;
};

export default RequireSubscription;
