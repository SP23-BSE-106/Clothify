import { generateToken, verifyAuth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Admin from "@/models/Admin";
import Customer from "@/models/Customer";
import bcrypt from "bcryptjs";

// Utility: set cookie headers
function setAuthCookie(token) {
  const isProduction = process.env.NODE_ENV === 'production';
  const secureFlag = isProduction ? 'Secure;' : '';
  // Set both HttpOnly and non-HttpOnly cookies
  const httpOnlyCookie = `token=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax; ${secureFlag}`;
  const jsCookie = `token=${token}; Path=/; Max-Age=86400; SameSite=Lax; ${secureFlag}`;
  // Return both cookies as array for Set-Cookie header
  return [httpOnlyCookie, jsCookie];
}

// Handle different HTTP methods
export async function POST(req) {
  try {
    await dbConnect();
    const { name, email, password, role, rollNo, teacherId } = await req.json();

    if (!name || !email || !password || !role) {
      return new Response(JSON.stringify({ error: "Name, email, password, and role are required" }), { status: 400 });
    }

    // Check if user already exists
    let existingUser;
    switch (role) {
      case "admin":
        existingUser = await Admin.findOne({ email });
        break;
      case "customer":
        existingUser = await Customer.findOne({ email });
        break;
      default:
        return new Response(JSON.stringify({ error: "Invalid role" }), { status: 400 });
    }

    if (existingUser) {
      return new Response(JSON.stringify({ error: "User already exists" }), { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user based on role
    let newUser;
    switch (role) {
      case "admin":
        newUser = new Admin({ name, email, password: hashedPassword });
        break;
      case "customer":
        newUser = new Customer({ name, email, password: hashedPassword });
        break;
    }

    await newUser.save();

    // Generate token
    const token = generateToken({ id: newUser._id.toString(), email: newUser.email, role: role, name: newUser.name });
    const cookieHeaders = setAuthCookie(token);

    // Add redirect URL based on role
    let responseBody = { message: "Registration successful", user: { id: newUser._id.toString(), name: newUser.name, email: newUser.email, role: role } };
    if (role === "admin") {
      responseBody.redirect = "/admins/dashboard";
    }
    return new Response(JSON.stringify(responseBody), {
      status: 201,
      headers: { "Set-Cookie": cookieHeaders, "Access-Control-Allow-Credentials": "true" },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await dbConnect();
    const { email, password, role } = await req.json();

    if (!email || !password || !role) {
      return new Response(JSON.stringify({ error: "Email, password, and role are required" }), { status: 400 });
    }

    let user;
    switch (role) {
      case "admin":
        user = await Admin.findOne({ email });
        break;
      case "customer":
        user = await Customer.findOne({ email });
        break;
      default:
        return new Response(JSON.stringify({ error: "Invalid role" }), { status: 400 });
    }

    if (!user) {
      return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401 });
    }

    const token = generateToken({ id: user._id.toString(), email: user.email, role: role, name: user.name });
    const cookieHeaders = setAuthCookie(token);

    console.log("Login successful for user:", user);
    // Add redirect URL based on role
    let responseBody = { message: "Login successful", user: { id: user._id.toString(), name: user.name, email: user.email, role: role } };
    if (role === "admin") {
      responseBody.redirect = "/admins/dashboard";
    }
    return new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: { "Set-Cookie": cookieHeaders, "Access-Control-Allow-Credentials": "true" },
    });
  } catch (error) {
    console.error("Login error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
