const validatePasswordStrength = (password: string): string[] => {
  const issues: string[] = [];
  if (password.length < 12) {
    issues.push("Password must contain at least 12 characters.");
  }
  if (!/[a-z]/.test(password)) {
    issues.push("Password must include a lowercase letter.");
  }
  if (!/[A-Z]/.test(password)) {
    issues.push("Password must include an uppercase letter.");
  }
  if (!/[0-9]/.test(password)) {
    issues.push("Password must include a number.");
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    issues.push("Password must include a special character.");
  }
  return issues;
};

export { validatePasswordStrength };
