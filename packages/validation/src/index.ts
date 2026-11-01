import { z } from 'zod';

export const RegistrationSchema = z.object({
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  complete_address: z.string().min(5, 'Complete address is required'),
  city: z.string().min(2, 'City/Municipality is required'),
  province: z.string().min(2, 'Province/Region is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirm_password: z.string(),
  philsys_id: z.string().optional(),
  phone_number: z.string().regex(/^(\+63|0)9\d{9}$/, 'Invalid Philippine mobile number (e.g. 09171234567)').optional().or(z.literal('')),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

export type RegistrationInput = z.infer<typeof RegistrationSchema>;

export const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

export const ProfileCompletionSchema = z.object({
  first_name: z.string().min(2, 'First name is required'),
  last_name: z.string().min(2, 'Last name is required'),
  complete_address: z.string().min(5, 'Complete address is required'),
  city: z.string().min(2, 'City is required'),
  province: z.string().min(2, 'Province is required'),
  philsys_id: z.string().optional(),
  phone_number: z.string().optional(),
});

export type ProfileCompletionInput = z.infer<typeof ProfileCompletionSchema>;

export const ProductRegistrationSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters'),
  barcode: z.string().min(4, 'Barcode must be at least 4 digits').max(32, 'Barcode cannot exceed 32 characters'),
  category_id: z.string().uuid('Please select a valid category'),
  brand_id: z.string().uuid('Please select a valid brand').optional().nullable(),
  package_quantity: z.coerce.number().positive('Package quantity must be greater than 0'),
  unit_id: z.string().uuid('Please select a valid unit'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  initial_store_id: z.string().uuid('Please select a store'),
  initial_price: z.coerce.number().positive('Price must be greater than ₱0.00'),
  observation_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid observation date',
  }),
  image_url: z.string().url().optional().nullable(),
  receipt_image_url: z.string().url().optional().nullable(),
  remarks: z.string().max(300).optional(),
});

export type ProductRegistrationInput = z.infer<typeof ProductRegistrationSchema>;

export const PriceSubmissionSchema = z.object({
  product_id: z.string().uuid('Please select a product'),
  store_id: z.string().uuid('Please select a store'),
  observed_price: z.coerce.number().positive('Observed price must be greater than ₱0.00'),
  observation_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid observation date',
  }),
  evidence_image_url: z.string().url().optional().nullable(),
  receipt_image_url: z.string().url().optional().nullable(),
  remarks: z.string().max(300).optional(),
});

export type PriceSubmissionInput = z.infer<typeof PriceSubmissionSchema>;

export const StoreSuggestionSchema = z.object({
  store_id: z.string().uuid().optional().nullable(),
  suggested_name: z.string().min(2, 'Store name is required'),
  suggested_branch: z.string().optional(),
  suggested_store_type: z.enum(['supermarket', 'wet_market', 'grocery', 'convenience', 'wholesale']),
  suggested_address: z.string().min(5, 'Address is required'),
  suggested_city: z.string().min(2, 'City is required'),
  suggested_province: z.string().min(2, 'Province is required'),
  suggested_latitude: z.number().min(-90).max(90),
  suggested_longitude: z.number().min(-180).max(180),
  remarks: z.string().max(300).optional(),
});

export type StoreSuggestionInput = z.infer<typeof StoreSuggestionSchema>;

export const VerificationDecisionSchema = z.object({
  submission_id: z.string().uuid(),
  submission_type: z.enum(['product', 'price', 'store']),
  action: z.enum(['approve', 'reject', 'request_clarification']),
  verifier_remarks: z.string().optional(),
}).refine((data) => {
  if ((data.action === 'reject' || data.action === 'request_clarification') && (!data.verifier_remarks || data.verifier_remarks.trim().length < 3)) {
    return false;
  }
  return true;
}, {
  message: 'Remarks explaining the decision are required when rejecting or requesting clarification',
  path: ['verifier_remarks'],
});

export type VerificationDecisionInput = z.infer<typeof VerificationDecisionSchema>;
