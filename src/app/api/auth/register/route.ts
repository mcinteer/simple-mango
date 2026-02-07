import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { getDb } from "@/lib/db/client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, ageVerified } = body;

    // Validate input
    if (!email || !name || !password) {
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: "All fields are required" } },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: "Invalid email format" } },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          error: {
            code: "BAD_REQUEST",
            message: "Password must be at least 8 characters",
          },
        },
        { status: 400 }
      );
    }

    if (ageVerified !== true) {
      return NextResponse.json(
        {
          error: {
            code: "BAD_REQUEST",
            message: "Age verification is required",
          },
        },
        { status: 400 }
      );
    }

    const db = await getDb();
    const existing = await db.collection("users").findOne({ email: email.toLowerCase() });

    if (existing) {
      return NextResponse.json(
        {
          error: {
            code: "CONFLICT",
            message: "An account with this email already exists",
          },
        },
        { status: 409 }
      );
    }

    const passwordHash = await hash(password, 12);
    const now = new Date().toISOString();

      const normalizedEmail = email.toLowerCase();
    
      const result = await db.collection("users").insertOne({
        email: normalizedEmail,
        name,
        passwordHash,
        provider: "credentials",
        ageVerified: true,
        createdAt: now,
        updatedAt: now,
      });
  
      return NextResponse.json(
        { data: { id: result.insertedId.toString(), email: normalizedEmail } },
        { status: 201 }
      );
  } catch {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}
