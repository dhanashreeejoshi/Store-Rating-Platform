const { z } = require('zod');

// Password rule: 8-16 characters, >=1 uppercase, >=1 special character
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(16, 'Password cannot exceed 16 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Password must contain at least one special character');

// Name rule: 20-60 characters
const nameSchema = z
  .string()
  .trim()
  .min(20, 'Name must be at least 20 characters long')
  .max(60, 'Name cannot exceed 60 characters');

// Email rule: valid format, lowercase, trimmed
const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email('Invalid email address format');

// Address rule: max 400 characters
const addressSchema = z
  .string()
  .trim()
  .max(400, 'Address cannot exceed 400 characters')
  .optional()
  .or(z.literal(''));

const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  address: addressSchema,
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
});

module.exports = {
  passwordSchema,
  nameSchema,
  emailSchema,
  addressSchema,
  registerSchema,
  loginSchema,
  changePasswordSchema,
};
