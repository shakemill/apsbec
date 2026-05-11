import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { getConfig } from "./blob"

const SESSION_COOKIE = "apsbec_admin"
const SESSION_SECRET = process.env.SESSION_SECRET ?? "changeme"

export async function hashCode(code: string): Promise<string> {
  return bcrypt.hash(code, 10)
}

export async function verifyAdminCode(code: string): Promise<boolean> {
  const config = await getConfig()
  if (!config?.codeAdminHash) return false
  return bcrypt.compare(code, config.codeAdminHash)
}

export async function setAdminSession(): Promise<void> {
  const store = await cookies()
  store.set(SESSION_COOKIE, SESSION_SECRET, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8, // 8h
    path: "/",
  })
}

export async function clearAdminSession(): Promise<void> {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies()
  return store.get(SESSION_COOKIE)?.value === SESSION_SECRET
}
