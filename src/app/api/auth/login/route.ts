// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
// In a real app:
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken'; // For session tokens
// import { cookies } from 'next/headers'; // To set cookies

// --- Zod Schema for Login Input Validation ---
const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }).toLowerCase(),
  password: z.string().min(1, { message: "Password cannot be empty." }), // Basic check, length checked at signup
  rememberMe: z.boolean().optional(),
});

// --- Mock Database (Should be the same instance as in signup/route.ts if testing locally without persistence) ---
// THIS IS STILL A MOCK. In a real app, this comes from your actual database.
interface User {
  id: string;
  fullName: string;
  email: string;
  hashedPassword?: string;
  createdAt: Date;
}
// To simulate users created by the signup endpoint, this array would need to be
// shared or (preferably) you'd use a real database.
// For this example, let's assume the `users` array from `signup/route.ts` is accessible
// or you pre-populate it for testing.
// This is a major limitation of in-memory mocks across different route files.
// For a true test, you'd need to manually add a user here or use a shared mock DB module.
const users: User[] = [
  // Example pre-populated user for testing login (password would be 'hashed_password123_random')
  // { id: '1', fullName: 'Test User', email: 'test@example.com', hashedPassword: 'hashed_password123_mock', createdAt: new Date() }
];

// TypeScript global augmentation for mockUsers
declare global {
  // eslint-disable-next-line no-var
  var mockUsers: User[] | undefined;
}

// Helper to add mock user from signup (if you're testing in sequence)
// This is not how a real app works, just for this example's continuity
if (typeof global.mockUsers === 'undefined') {
  global.mockUsers = users;
}


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          message: "Invalid input.",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, password, rememberMe } = validation.data;

    // 1. Find user by email (Mock DB)
    // const user = await db.user.findUnique({ where: { email } });
    const user = (global.mockUsers ?? []).find(u => u.email === email);

    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password." }, // Generic message for security
        { status: 401 } // Unauthorized
      );
    }

    // 2. Compare password (Mock Comparison)
    // In a real app: const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);
    // This mock comparison is NOT secure and only for demonstration.
    // It assumes the mock signup route's hashing pattern.
    const isPasswordValid = user.hashedPassword?.startsWith(`hashed_${password}_`);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 }
      );
    }

    // 3. Password is valid - Create session (Conceptual)
    // In a real app:
    // const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: rememberMe ? '30d' : '1h' });
    // cookies().set('session_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/', maxAge: rememberMe ? 30*24*60*60 : 60*60 });

    console.log(`Mock login successful for: ${user.email}, RememberMe: ${rememberMe}`);

    return NextResponse.json(
      {
        message: "Login successful!",
        user: { id: user.id, fullName: user.fullName, email: user.email }, // Send non-sensitive user info
        redirectUrl: '/dashboard'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Login API Error:', error);
    if (error instanceof SyntaxError) {
        return NextResponse.json({ message: 'Invalid JSON payload' }, { status: 400 });
    }
    return NextResponse.json(
      { message: "An unexpected error occurred on the server." },
      { status: 500 }
    );
  }
}