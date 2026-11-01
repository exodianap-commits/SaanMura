import { 
  RegistrationSchema, LoginSchema, PriceSubmissionSchema, VerificationDecisionSchema 
} from '../packages/validation/src/index';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log('--- Running SaanMura Validation Zod Schema Tests ---');

// Test 1: Valid Registration
const validReg = RegistrationSchema.safeParse({
  first_name: 'Juan',
  last_name: 'Dela Cruz',
  complete_address: '123 Kalayaan Ave, Diliman',
  city: 'Quezon City',
  province: 'Metro Manila',
  email: 'juan@example.com',
  password: 'Password123!',
  confirm_password: 'Password123!',
  phone_number: '09171234567',
});
assert(validReg.success === true, 'Valid registration must pass');

// Test 2: Mismatched Passwords
const mismatchReg = RegistrationSchema.safeParse({
  first_name: 'Juan',
  last_name: 'Dela Cruz',
  complete_address: '123 Kalayaan Ave, Diliman',
  city: 'Quezon City',
  province: 'Metro Manila',
  email: 'juan@example.com',
  password: 'Password123!',
  confirm_password: 'DifferentPassword123!',
});
assert(mismatchReg.success === false, 'Mismatched passwords must fail');

// Test 3: Verification Decision: Mandatory rejection remarks
const validApproval = VerificationDecisionSchema.safeParse({
  submission_id: '11111111-1111-1111-1111-111111111111',
  submission_type: 'price',
  action: 'approve',
});
assert(validApproval.success === true, 'Approval without remarks should pass');

const invalidRejection = VerificationDecisionSchema.safeParse({
  submission_id: '11111111-1111-1111-1111-111111111111',
  submission_type: 'price',
  action: 'reject',
  verifier_remarks: '',
});
assert(invalidRejection.success === false, 'Rejection without mandatory reason must fail');

const validRejection = VerificationDecisionSchema.safeParse({
  submission_id: '11111111-1111-1111-1111-111111111111',
  submission_type: 'price',
  action: 'reject',
  verifier_remarks: 'Shelf tag was blurred and receipt date is outdated.',
});
assert(validRejection.success === true, 'Rejection with valid reason must pass');

console.log('✅ All Validation Schema Tests Passed Successfully!\n');
