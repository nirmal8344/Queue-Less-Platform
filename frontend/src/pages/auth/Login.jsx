import React from 'react';
import { CustomerLogin } from './CustomerLogin';

export { CustomerLogin };
export { StaffLogin } from './StaffLogin';
export { AdminLogin } from './AdminLogin';

export const Login = (props) => {
  return <CustomerLogin {...props} />;
};
