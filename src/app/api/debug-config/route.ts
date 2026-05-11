import { NextResponse } from "next/server"
import { getConfig } from "@/lib/blob"

// ⚠️  Route de diagnostic temporaire — à supprimer après debug
export async function GET() {
  const config = await getConfig()
  const initCode = process.env.ADMIN_CODE_INIT

  return NextResponse.json({
    blob_token_present: !!process.env.BLOB_READ_WRITE_TOKEN,
    blob_token_value:
      process.env.BLOB_READ_WRITE_TOKEN
        ? process.env.BLOB_READ_WRITE_TOKEN.slice(0, 12) + "…"
        : null,
    admin_code_init_present: !!initCode,
    admin_code_init_value: initCode ?? "(non défini → défaut: APSBEC2024)",
    config_exists: !!config,
    config_has_hash: !!config?.codeAdminHash,
    session_secret_present: !!process.env.SESSION_SECRET,
  })
}
