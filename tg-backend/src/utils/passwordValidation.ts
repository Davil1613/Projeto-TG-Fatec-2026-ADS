export interface PasswordValidationResult {
  valid: boolean;
  message?: string;
}

export function validatePasswordStrength(password: string): PasswordValidationResult {
  if (!password || password.length < 8) {
    return { valid: false, message: 'A senha deve ter no mínimo 8 caracteres.' };
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'A senha deve conter ao menos uma letra maiúscula.' };
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'A senha deve conter ao menos uma letra minúscula.' };
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'A senha deve conter ao menos um número.' };
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return { valid: false, message: 'A senha deve conter ao menos um caractere especial.' };
  }

  return { valid: true };
}
