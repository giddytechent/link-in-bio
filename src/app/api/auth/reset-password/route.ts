// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
// In a real app, you'd use:
// import bcrypt from 'bcryptjs';

// --- Zod Schema for Reset Password Input Validation ---
const resetPasswordSchema = z.object({
  token: z.string().min(1, { message: "Reset token is required." }),
  newPassword: z.string().min(8, { message: "Password must be at least 8 characters long." }),
});

// --- Mock Database (Same instance considerations as other auth routes) ---
interface User {
  id: string;
  fullName: string;
  email: string;
  hashedPassword?: string;
  createdAt: Date;
  resetPasswordToken?: string; // This would be the HASHED token in a real DB
  resetPasswordTokenExpiry?: Date;
}
// This global.mockUsers is a hack for local dev without a DB.
if (typeof global.mockUsers === 'undefined') {
  global.mockUsers = [];
}
const users: User[] = global.mockUsers;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = resetPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          message: "Invalid input.",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { token: rawTokenFromLink, newPassword } = validation.data;

    // 1. Find user by THE HASHED VERSION OF THE RAW TOKEN and check expiry (Mock DB)
    // In a real app:
    // const hashedTokenFromLink = await bcrypt.hash(rawTokenFromLink, SOME_PEPPER_OR_STATIC_SALT_FOR_LOOKUP_ONLY_IF_NECESSARY_OR_FIND_USER_BY_OTHER_MEANS_FIRST);
    // OR BETTER: The token in the link should be a lookup key, and the actual comparison token is stored hashed in the DB.
    // For this mock, we'll assume the stored token is `hashed_${rawTokenFromLink}` and it's not expired.

    // This mock logic is simplified: we find a user whose (mock) hashed token matches the expected pattern based on the raw token.
    // And we check if the token has expired.
    const userIndex = users.findIndex(u =>
      u.resetPasswordToken === `hashed_${rawTokenFromLink}` && // Compare with the "hashed" version
      u.resetPasswordTokenExpiry && u.resetPasswordTokenExpiry > new Date()
    );

    if (userIndex === -1) {
      return NextResponse.json(
        { message: "Invalid or expired password reset token. Please request a new one." },
        { status: 400 } // Bad Request or 401 Unauthorized
      );
    }

    const user = users[userIndex];

    // 2. Hash the new password (Mock Hashing)
    // In a real app:
    // const salt = await bcrypt.genSalt(10);
    // const newHashedPassword = await bcrypt.hash(newPassword, salt);
    const newHashedPassword = `hashed_${newPassword}_${Math.random().toString(36).substring(7)}`; // DO NOT USE IN PRODUCTION

    // 3. Update user's password and invalidate the reset token (Mock DB Update)
    // await db.user.update({
    //   where: { id: user.id },
    //   data: {
    //     hashedPassword: newHashedPassword,
    //     resetPasswordToken: null, // Invalidate token
    //     resetPasswordTokenExpiry: null,
    //   }
    // });
    users[userIndex] = {
      ...user,
      hashedPassword: newHashedPassword,
      resetPasswordToken: undefined, // Invalidate token
      resetPasswordTokenExpiry: undefined,
    };
    console.log(`Password reset successfully for ${user.email}`);

    return NextResponse.json(
      { message: "Your password has been reset successfully!" },
      { status: 200 }
    );

  } catch (error) {
    console.error('Reset Password API Error:', error);
    if (error instanceof SyntaxError) {
        return NextResponse.json({ message: 'Invalid JSON payload' }, { status: 400 });
    }
    return NextResponse.json(
      { message: "An unexpected error occurred on the server." },
      { status: 500 }
    );
  }
}