// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
// In a real app, you'd use:
// import crypto from 'crypto'; // For generating secure tokens
// import { sendPasswordResetEmail } from '@/lib/email'; // Your email sending utility

// --- Zod Schema for Email Validation ---
const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }).toLowerCase(),
});

// --- Mock Database (Same instance considerations as login/signup) ---
interface User {
  id: string;
  fullName: string;
  email: string;
  hashedPassword?: string;
  createdAt: Date;
  resetPasswordToken?: string; // Store hashed token
  resetPasswordTokenExpiry?: Date;
}
// This global.mockUsers is a hack for local dev without a DB.
// It should be replaced with a proper database.
if (typeof global.mockUsers === 'undefined') {
  global.mockUsers = [];
}
const users: User[] = global.mockUsers;

// --- Mock Email Sending Function ---
async function mockSendPasswordResetEmail(email: string, token: string) {
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
  console.log(`\n--- MOCK EMAIL ---`);
  console.log(`To: ${email}`);
  console.log(`Subject: Reset Your FlowFolio Password`);
  console.log(`Body: Click here to reset your password: ${resetLink}`);
  console.log(`(This email is mocked and not actually sent.)`);
  console.log(`--- END MOCK EMAIL ---\n`);
  // In a real app, use an email service like SendGrid, Mailgun, Resend, etc.
  // await sendPasswordResetEmail(email, resetLink);
  return Promise.resolve();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = forgotPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          message: "Invalid email format.",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    // 1. Find user by email (Mock DB)
    // const user = await db.user.findUnique({ where: { email } });
    const userIndex = users.findIndex(u => u.email === email);

    if (userIndex === -1) {
      // SECURITY NOTE: To prevent email enumeration, always return a generic success-like message
      // even if the email is not found. The email is only sent if the user exists.
      console.log(`Forgot password attempt for non-existent email: ${email}`);
      return NextResponse.json(
        { message: "If your email address is in our system, you will receive a password reset link shortly." },
        { status: 200 }
      );
    }

    const user = users[userIndex];

    // 2. Generate a secure, unique, time-limited reset token (Mock Token Generation)
    // In a real app:
    // const rawToken = crypto.randomBytes(32).toString('hex');
    // const hashedToken = await bcrypt.hash(rawToken, 10); // Hash the token before storing
    // const expiryDate = new Date(Date.now() + 3600000); // Token expires in 1 hour
    const mockRawToken = `reset_${Math.random().toString(36).substring(2)}_${Date.now()}`;
    const mockHashedToken = `hashed_${mockRawToken}`; // Simulate hashing
    const expiryDate = new Date(Date.now() + 3600000); // 1 hour expiry

    // 3. Store the (hashed) token and its expiry with the user record (Mock DB Update)
    // await db.user.update({ where: { email }, data: { resetPasswordToken: hashedToken, resetPasswordTokenExpiry: expiryDate } });
    users[userIndex] = {
      ...user,
      resetPasswordToken: mockHashedToken,
      resetPasswordTokenExpiry: expiryDate,
    };
    console.log(`Password reset token generated for ${email}: ${mockRawToken} (Hashed: ${mockHashedToken})`);

    // 4. Send the password reset email (with the raw, unhashed token in the link)
    await mockSendPasswordResetEmail(email, mockRawToken); // Send the raw token in the link

    return NextResponse.json(
      { message: "If your email address is in our system, you will receive a password reset link shortly." },
      { status: 200 }
    );

  } catch (error) {
    console.error('Forgot Password API Error:', error);
    if (error instanceof SyntaxError) {
        return NextResponse.json({ message: 'Invalid JSON payload' }, { status: 400 });
    }
    // Even for server errors, consider a generic message to the client for security in this flow.
    return NextResponse.json(
      { message: "An error occurred. Please try again later." },
      { status: 500 }
    );
  }
}