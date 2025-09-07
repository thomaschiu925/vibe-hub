import type { NextRequest } from "next/server"
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Music API called with URL:", request.url)

    const { searchParams } = new URL(request.url)
    const text = searchParams.get("text") || "A peaceful ambient track"
    const duration_seconds = Number.parseInt(searchParams.get("duration") || "30")

    console.log("[v0] Music API params:", { text, duration_seconds })

    const apiKey = process.env.ELEVENLABS_API_KEY
    console.log("[v0] Environment check - ELEVENLABS_API_KEY exists:", !!apiKey)
    console.log("[v0] Environment check - API key length:", apiKey?.length || 0)
    console.log(
      "[v0] Environment check - All env vars starting with ELEVEN:",
      Object.keys(process.env).filter((key) => key.startsWith("ELEVEN")),
    )

    if (!apiKey) {
      console.error("[v0] ElevenLabs API key not found")
      return new Response(
        JSON.stringify({
          error: "ElevenLabs API key not configured",
          debug: {
            envVarsFound: Object.keys(process.env).filter((key) => key.startsWith("ELEVEN")),
            totalEnvVars: Object.keys(process.env).length,
          },
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    console.log("[v0] ElevenLabs API key found, creating client")
    const elevenlabs = new ElevenLabsClient({
      apiKey: apiKey,
    })

    console.log("[v0] Calling ElevenLabs music.stream API")
    const audioStream = await elevenlabs.music.stream({
      prompt: text,
      music_length_ms: duration_seconds * 1000,
    })

    console.log("[v0] Audio stream received successfully")
    return new Response(audioStream, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
      },
    })
  } catch (error) {
    console.error("[v0] Error in music generation:", error)
    return new Response(
      JSON.stringify({
        error: "Music generation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
