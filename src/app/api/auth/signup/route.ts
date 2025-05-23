// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod'; // For data validation
// In a real app, you'd use a proper hashing library:
// import bcrypt from 'bcryptjs';

// --- Zod Schema for Input Validation ---
const signupSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters long." }).trim(),
  email: z.string().email({ message: "Invalid email address." }).toLowerCase(),
  password: z.string().min(8, { message: "Password must be at least 8 characters long." }),
});

// --- Mock Database (Replace with actual database calls) ---
// This is a very simple in-memory store for demonstration.
// In a real app, DO NOT USE THIS. Use a proper database.
interface User {
  id: string;
  fullName: string;
  email: string;
  hashedPassword?: string; // Store hashed password
  createdAt: Date;
}
const users: User[] = []; // Our mock user store

export async function POST(request: NextRequest) {
  try {
    // 1. Parse the request body
    const body = await request.json();

    // 2. Validate the input data using Zod
    const validation = signupSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          message: "Invalid input.",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 } // Bad Request
      );
    }

    const { fullName, email, password } = validation.data;

    // 3. Check if user already exists (Mock DB Check)
    // In a real app, query your database:
    // const existingUser = await db.user.findUnique({ where: { email } });
    const existingUser = users.find(user => user.email === email);

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists." },
        { status: 409 } // Conflict
      );
    }

    // 4. Hash the password (Mock Hashing)
    // In a real app, use bcrypt or argon2:
    // const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash(password, salt);
    const hashedPassword = `hashed_${password}_${Math.random().toString(36).substring(7)}`; // DO NOT USE THIS IN PRODUCTION

    // 5. Create and save the new user (Mock DB Save)
    const newUser: User = {
      id: String(users.length + 1), // Simple ID generation
      fullName,
      email,
      hashedPassword,
      createdAt: new Date(),
    };
    users.push(newUser); // Add to our mock store
    console.log('New user created (mock):', { id: newUser.id, fullName: newUser.fullName, email: newUser.email }); // Log for debugging

    // 6. (Optional) Send verification email or other post-signup actions
    // e.g., await sendVerificationEmail(newUser.email, verificationToken);

    // 7. Return a success response
    return NextResponse.json(
      {
        message: "Account created successfully!",
        // Optionally, you might return some non-sensitive user info or a redirect hint
        user: { id: newUser.id, fullName: newUser.fullName, email: newUser.email },
        redirectUrl: '/login' // Suggest where the frontend should redirect
      },
      { status: 201 } // Created
    );

  } catch (error) {
    console.error('Signup API Error:', error);
    // Handle potential JSON parsing errors or other unexpected errors
    if (error instanceof SyntaxError) {
        return NextResponse.json({ message: 'Invalid JSON payload' }, { status: 400 });
    }
    return NextResponse.json(
      { message: "An unexpected error occurred on the server." },
      { status: 500 } // Internal Server Error
    );
  }
}