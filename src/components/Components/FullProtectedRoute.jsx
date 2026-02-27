import React, { useContext, useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { Context } from '../context/Context';
import { toast } from 'react-toastify';

const FullProtectedRoute = ({ element: Component, featureName, requirePlanCheck = false }) => {
  const isAuthenticated = localStorage.getItem('authToken');
  const { subscriptionStatus, loadingUser } = useContext(Context);
  const toastShownRef = useRef(false);

  // Always call useEffect, but run toast only if plan check is needed
  useEffect(() => {
    if (!requirePlanCheck) return;

    const isBasicPlan = subscriptionStatus?.is_active && subscriptionStatus?.plan === 'BASIC';

    if (isBasicPlan && !toastShownRef.current) {
      toast.error(`Please upgrade your plan to access ${featureName}.`, {
        position: 'top-right',
        autoClose: 3000,
      });
      toastShownRef.current = true;
    }
  }, [subscriptionStatus, featureName, requirePlanCheck]);

  // Auth check
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Loading guard
  if (loadingUser || (requirePlanCheck && subscriptionStatus === undefined)) {
    return null; // or a loader/spinner
  }

  // Plan restriction
  if (requirePlanCheck) {
    const isBasicPlan = subscriptionStatus?.is_active && subscriptionStatus?.plan === 'BASIC';
    if (isBasicPlan) return <Navigate to="/dashboard" replace />;
  }

  return <Component />;
};

export default FullProtectedRoute;
