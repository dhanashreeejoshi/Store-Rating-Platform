const { z } = require('zod');
const { nameSchema, emailSchema, passwordSchema, addressSchema } = require('./authValidator');

const createUserSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  address: addressSchema,
  role: z.enum(['ADMIN', 'USER', 'STORE_OWNER'], {
    errorMap: () => ({ message: 'Role must be one of ADMIN, USER, STORE_OWNER' }),
  }),
});

const createStoreSchema = z.object({
  name: z.string().trim().min(1, 'Store name is required').max(255, 'Store name cannot exceed 255 characters'),
  email: emailSchema,
  address: z.string().trim().min(1, 'Store address is required').max(400, 'Store address cannot exceed 400 characters'),
  owner_id: z.coerce.number().int().positive('Valid store owner ID is required'),
});

module.exports = {
  createUserSchema,
  createStoreSchema,
};
