export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const re = /^[0-9]{10}$/;
  return re.test(phone);
};

export const validatePassword = (password) => {
  if (password.length < 6) return 'Password must be at least 6 characters';
  return null;
};

export const validatePincode = (pincode) => {
  const re = /^[0-9]{6}$/;
  return re.test(pincode);
};

export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateSignupForm = (values) => {
  const errors = {};
  
  if (!values.full_name?.trim()) errors.full_name = 'Full name is required';
  if (!values.email?.trim()) errors.email = 'Email is required';
  else if (!validateEmail(values.email)) errors.email = 'Invalid email address';
  if (!values.phone?.trim()) errors.phone = 'Phone number is required';
  else if (!validatePhone(values.phone)) errors.phone = 'Enter a valid 10-digit phone number';
  if (!values.password) errors.password = 'Password is required';
  else if (values.password.length < 6) errors.password = 'Password must be at least 6 characters';
  if (!values.confirmPassword) errors.confirmPassword = 'Confirm password is required';
  else if (values.password !== values.confirmPassword) errors.confirmPassword = 'Passwords do not match';

  return errors;
};

export const validateLoginForm = (values) => {
  const errors = {};
  
  if (!values.email?.trim()) errors.email = 'Email is required';
  else if (!validateEmail(values.email)) errors.email = 'Invalid email address';
  if (!values.password) errors.password = 'Password is required';

  return errors;
};

export const validateAddressForm = (values) => {
  const errors = {};
  
  if (!values.full_name?.trim()) errors.full_name = 'Full name is required';
  if (!values.phone?.trim()) errors.phone = 'Phone number is required';
  else if (!validatePhone(values.phone)) errors.phone = 'Enter a valid 10-digit phone number';
  if (!values.address1?.trim()) errors.address1 = 'Address is required';
  if (!values.city?.trim()) errors.city = 'City is required';
  if (!values.district?.trim()) errors.district = 'District is required';
  if (!values.state?.trim()) errors.state = 'State is required';
  if (!values.pincode?.trim()) errors.pincode = 'Pincode is required';
  else if (!validatePincode(values.pincode)) errors.pincode = 'Enter a valid 6-digit pincode';

  return errors;
};
