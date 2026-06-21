import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { settingsSchema } from "@/schemas"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const settings = await prisma.systemSettings.findMany({
      orderBy: { key: "asc" },
    })

    return Response.json(settings)
  } catch (error) {
    console.error("Error fetching settings:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const parsed = settingsSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data = parsed.data

    const setting = await prisma.systemSettings.upsert({
      where: { key: data.key },
      update: { value: data.value, description: data.description || null },
      create: {
        key: data.key,
        value: data.value,
        description: data.description || null,
      },
    })

    return Response.json(setting, { status: 200 })
  } catch (error) {
    console.error("Error updating setting:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
