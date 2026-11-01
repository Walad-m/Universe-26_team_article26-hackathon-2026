"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string; // "project_lead", "purchasing", "consultant"
  companyId: string | null;
  companyName: string;
  companyType: string; // "client" or "supplier"
}

const SESSION_COOKIE_NAME = "orvix_session";

/**
 * Retrieves the currently authenticated session user from HTTP-only cookie
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  try {
    const parsed = JSON.parse(sessionCookie.value) as SessionUser;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Authenticates user credentials and establishes a session cookie
 */
export async function loginUser(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; redirectUrl?: string }> {
  if (!email || !password) {
    return { success: false, error: "Please enter both corporate email and password." };
  }

  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    include: { company: true },
  });

  if (!user || user.password !== password) {
    return { success: false, error: "Invalid corporate credentials. Please check your email and password." };
  }

  const sessionData: SessionUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    companyId: user.companyId,
    companyName: user.company?.name ?? "Independent",
    companyType: user.company?.type ?? "supplier",
  };

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  const redirectUrl = "/dashboard";
  return { success: true, redirectUrl };
}

/**
 * Registers a new organization and primary administrative user account
 */
export async function registerOrganizationUser(data: {
  companyName: string;
  companyType: "client" | "supplier";
  userName: string;
  email: string;
  password: string;
  role: "project_lead" | "purchasing" | "consultant";
}): Promise<{ success: boolean; error?: string; redirectUrl?: string }> {
  const { companyName, companyType, userName, email, password, role } = data;

  if (!companyName || !userName || !email || !password) {
    return { success: false, error: "All fields are required to register your workspace." };
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existing) {
    return { success: false, error: "An account with this email address already exists." };
  }

  // Create company
  const company = await prisma.company.create({
    data: {
      name: companyName.trim(),
      type: companyType,
    },
  });

  // Create user
  const newUser = await prisma.user.create({
    data: {
      name: userName.trim(),
      email: normalizedEmail,
      password: password,
      role,
      companyId: company.id,
    },
  });

  // Establish session
  const sessionData: SessionUser = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    companyId: company.id,
    companyName: company.name,
    companyType: company.type,
  };

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  const redirectUrl = role === "consultant" ? "/consultant" : role === "purchasing" ? "/purchasing" : "/lead";
  return { success: true, redirectUrl };
}

/**
 * Destroys user session and redirects to login
 */
export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect("/login");
}

