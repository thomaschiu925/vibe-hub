import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Image generation API called")
    const { prompt, instruments = [], style = "base", baseImage, frameNumber } = await request.json()
    console.log("[v0] Image generation params:", { prompt, instruments, style, frameNumber, hasBaseImage: !!baseImage })

    const apiKey = process.env.GEMINI_API_KEY
    console.log("[v0] Gemini API key exists:", !!apiKey)

    if (!apiKey) {
      console.log("[v0] Gemini API key not found")
      return new Response(JSON.stringify({ error: "Gemini API key not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    const { GoogleGenerativeAI } = await import("@google/generative-ai")
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image-preview" })

    let imagePrompt = ""
    const instrumentLabels = Array.isArray(instruments) ? instruments.join(", ") : instruments || "piano"

    const imageSpecs = "Image dimensions: 1920x1080 pixels (16:9 aspect ratio, Full HD resolution). "

    if (style === "base") {
      imagePrompt = `${imageSpecs}Generate a high-detail realistic cartoon image of a chill girl studying in a cozy room with lo-fi aesthetic. 
      Scene should match "${prompt}" vibe with ${instrumentLabels} elements visible in the room. 
      Include: books, warm lighting, plants, rain outside window, vintage furniture, 
      soft pastel colors (muted blues, pinks, greens), nostalgic atmosphere, 
      anime-inspired art style similar to lo-fi hip hop study videos. 
      The girl should be relaxed, maybe wearing headphones or reading, 
      with ${instrumentLabels} subtly incorporated into the scene as visible instruments or music equipment.
      Ensure the image is exactly 1920x1080 pixels with crisp, high-definition quality suitable for desktop backgrounds.`

      // Base image generation - no reference image needed
      console.log("[v0] Calling Gemini API for base image with prompt:", imagePrompt)
      const response = await model.generateContent(imagePrompt)

      console.log("[v0] Gemini API response received")

      let imageUrl = null
      let textResponse = null

      const result = response.response
      if (
        result.candidates &&
        result.candidates[0] &&
        result.candidates[0].content &&
        result.candidates[0].content.parts
      ) {
        for (const part of result.candidates[0].content.parts) {
          if (part.text !== null && part.text !== undefined) {
            textResponse = part.text
            console.log("[v0] Gemini response text:", part.text)
          } else if (part.inlineData !== null && part.inlineData !== undefined) {
            const imageData = part.inlineData.data
            const mimeType = part.inlineData.mimeType || "image/png"
            imageUrl = `data:${mimeType};base64,${imageData}`
            console.log("[v0] Generated image data received, size:", imageData.length)
          }
        }
      }

      if (imageUrl) {
        console.log("[v0] Returning generated image")
        return new Response(
          JSON.stringify({
            imageUrl: imageUrl,
            prompt: imagePrompt,
            style: style,
            frameNumber: frameNumber || 1,
            instruments: instruments,
            geminiResponse: textResponse,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        )
      } else {
        // Fallback to placeholder if no image was generated
        const placeholderQuery =
          style === "animation"
            ? `lo-fi girl study scene frame ${frameNumber || 1} with ${instrumentLabels} and subtle movement`
            : `lo-fi girl study scene with ${instrumentLabels}`

        console.log("[v0] No image generated, returning placeholder with query:", placeholderQuery)

        return new Response(
          JSON.stringify({
            imageUrl: "/placeholder.svg?height=1080&width=1920&query=" + encodeURIComponent(placeholderQuery),
            prompt: imagePrompt,
            style: style,
            frameNumber: frameNumber || 1,
            instruments: instruments,
            geminiResponse: textResponse,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        )
      }
    } else if (style === "animation") {
      imagePrompt = `Using the provided reference image, create animation frame ${frameNumber} of 24 for this lo-fi study scene. 
      Make VERY SUBTLE changes while maintaining the exact same character, room layout, and ${instrumentLabels} elements. 
      Only apply gentle movements like: slight head tilt, page turning, gentle breathing, soft lighting changes, 
      rain droplet variations on window, or subtle atmospheric effects. 
      Keep the same cozy lo-fi aesthetic with muted pastels and maintain character consistency. 
      The changes should be barely noticeable for smooth 24fps animation.
      Maintain exact 1920x1080 pixel dimensions and same art style.`

      if (!baseImage) {
        throw new Error("Base image is required for animation frame generation")
      }

      console.log("[v0] Processing base image for image-to-image generation")

      // Extract base64 data from data URL
      const base64Data = baseImage.replace(/^data:image\/[a-z]+;base64,/, "")

      // Create image object for Gemini API
      const imageObject = {
        inlineData: {
          data: base64Data,
          mimeType: "image/png",
        },
      }

      console.log("[v0] Calling Gemini API for animation frame with reference image and prompt:", imagePrompt)

      const response = await model.generateContent([imagePrompt, imageObject])

      console.log("[v0] Gemini API response received")

      let imageUrl = null
      let textResponse = null

      const result = response.response
      if (
        result.candidates &&
        result.candidates[0] &&
        result.candidates[0].content &&
        result.candidates[0].content.parts
      ) {
        for (const part of result.candidates[0].content.parts) {
          if (part.text !== null && part.text !== undefined) {
            textResponse = part.text
            console.log("[v0] Gemini response text:", part.text)
          } else if (part.inlineData !== null && part.inlineData !== undefined) {
            const imageData = part.inlineData.data
            const mimeType = part.inlineData.mimeType || "image/png"
            imageUrl = `data:${mimeType};base64,${imageData}`
            console.log("[v0] Generated image data received, size:", imageData.length)
          }
        }
      }

      if (imageUrl) {
        console.log("[v0] Returning generated image")
        return new Response(
          JSON.stringify({
            imageUrl: imageUrl,
            prompt: imagePrompt,
            style: style,
            frameNumber: frameNumber || 1,
            instruments: instruments,
            geminiResponse: textResponse,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        )
      } else {
        // Fallback to placeholder if no image was generated
        const placeholderQuery = `lo-fi girl study scene frame ${frameNumber || 1} with ${instrumentLabels} and subtle movement`

        console.log("[v0] No image generated, returning placeholder with query:", placeholderQuery)

        return new Response(
          JSON.stringify({
            imageUrl: "/placeholder.svg?height=1080&width=1920&query=" + encodeURIComponent(placeholderQuery),
            prompt: imagePrompt,
            style: style,
            frameNumber: frameNumber || 1,
            instruments: instruments,
            geminiResponse: textResponse,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        )
      }
    }
  } catch (error) {
    console.error("[v0] Error in image generation:", error)
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
