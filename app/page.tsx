"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Play,
  Pause,
  Music,
  Loader2,
  Sparkles,
  Guitar,
  Piano,
  Drum,
  Zap,
  Music2,
  Headphones,
  Volume2,
  ImageIcon,
  Check,
  Film,
  Share2,
  RotateCcw,
  Download,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const instruments = [
  { value: "piano", label: "Piano", icon: Piano, description: "Soft, melodic keys" },
  { value: "guitar", label: "Guitar", icon: Guitar, description: "Warm, acoustic strums" },
  { value: "drums", label: "Drums", icon: Drum, description: "Gentle, rhythmic beats" },
  { value: "synth", label: "Synth", icon: Zap, description: "Dreamy, electronic tones" },
  { value: "bass", label: "Bass", icon: Music2, description: "Deep, grounding rhythms" },
  { value: "ambient", label: "Ambient", icon: Headphones, description: "Atmospheric soundscapes" },
  { value: "vinyl", label: "Vinyl Crackle", icon: Volume2, description: "Nostalgic record warmth" },
]

type FlowStep = "setup" | "scene" | "music" | "animation" | "complete"

export default function LoFiVibesGenerator() {
  const [prompt, setPrompt] = useState("")
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>(["piano"])
  const [duration, setDuration] = useState([30])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [showFlowModal, setShowFlowModal] = useState(false)
  const [currentStep, setCurrentStep] = useState<FlowStep>("setup")
  const [isGeneratingAnimation, setIsGeneratingAnimation] = useState(false)
  const [animationFrames, setAnimationFrames] = useState<string[]>([])
  const [animationProgress, setAnimationProgress] = useState(0)
  const [currentFrame, setCurrentFrame] = useState(0)
  const [sessionComplete, setSessionComplete] = useState(false)
  const [musicError, setMusicError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const animationRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  const handleInstrumentChange = (instrumentValue: string, checked: boolean) => {
    if (checked) {
      setSelectedInstruments((prev) => [...prev, instrumentValue])
    } else {
      setSelectedInstruments((prev) => prev.filter((inst) => inst !== instrumentValue))
    }
  }

  useEffect(() => {
    if (animationFrames.length > 0 && (currentStep === "animation" || currentStep === "complete")) {
      if (animationRef.current) {
        clearInterval(animationRef.current)
      }

      animationRef.current = setInterval(() => {
        setCurrentFrame((prev) => (prev + 1) % animationFrames.length)
      }, 1000)

      return () => {
        if (animationRef.current) {
          clearInterval(animationRef.current)
        }
      }
    }
  }, [animationFrames, currentStep])

  const stepConfig = {
    setup: { title: "Setup Your Vibe", icon: Music, description: "Choose instrument and describe your session" },
    scene: { title: "Creating Scene", icon: ImageIcon, description: "Crafting your study environment" },
    music: { title: "Generating Music", icon: Music, description: "Creating your lo-fi soundtrack" },
    animation: { title: "Adding Life", icon: Film, description: "Creating 24-frame animation" },
    complete: { title: "Session Ready", icon: Sparkles, description: "Your lo-fi experience is complete" },
  }

  const startGeneration = async () => {
    console.log("[v0] startGeneration called with:", { prompt, selectedInstruments, duration })

    if (!prompt.trim()) {
      console.log("[v0] Error: Empty prompt")
      toast({
        title: "Please describe your vibe",
        description: "Enter a description to generate your lo-fi session",
        variant: "destructive",
      })
      return
    }

    if (selectedInstruments.length === 0) {
      console.log("[v0] Error: No instruments selected")
      toast({
        title: "Please select at least one instrument",
        description: "Choose instruments to create your lo-fi session",
        variant: "destructive",
      })
      return
    }

    console.log("[v0] Starting generation flow with image first")
    setShowFlowModal(true)
    setCurrentStep("scene")
    setGeneratedImage(null)
    setAudioUrl(null)
    setAnimationFrames([])

    generateImage()
  }

  const generateImage = async () => {
    console.log("[v0] generateImage called")
    setIsGeneratingImage(true)

    try {
      console.log("[v0] Making image generation API call")
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt,
          instruments: selectedInstruments,
          style: "base",
        }),
      })

      console.log("[v0] Image API response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] Image API error response:", errorText)
        throw new Error("Failed to generate image")
      }

      const data = await response.json()
      console.log("[v0] Image generation successful:", data)
      setGeneratedImage(data.imageUrl)
      setIsGeneratingImage(false)

      toast({
        title: "Scene created!",
        description: "Review your lo-fi study scene and accept to continue",
      })
    } catch (error) {
      console.error("[v0] Error in generateImage:", error)
      setIsGeneratingImage(false)
      toast({
        title: "Scene generation failed",
        description: "There was an error creating your study scene",
        variant: "destructive",
      })
    }
  }

  const acceptImageAndGenerateAnimation = async () => {
    console.log("[v0] Image accepted, proceeding to animation generation")
    setCurrentStep("animation")
    generateAnimation()
  }

  const generateAnimation = async () => {
    console.log("[v0] generateAnimation called with image:", generatedImage)
    if (!generatedImage) return

    setIsGeneratingAnimation(true)
    setAnimationProgress(0)
    setAnimationFrames([])

    const frames: string[] = []
    const animationPrompts = [
      "slight head tilt left",
      "gentle eye blink",
      "page turning motion",
      "soft hair movement",
      "subtle hand gesture",
      "gentle breathing",
      "light rain animation",
      "window reflection change",
      "book page flutter",
      "pencil movement",
      "coffee steam rise",
      "plant leaf sway",
      "lamp light flicker",
      "shadow shift",
      "fabric wrinkle",
      "gentle head nod",
      "eye movement right",
      "finger tap",
      "paper rustle",
      "ambient light change",
      "dust particle float",
      "curtain gentle sway",
      "reflection shimmer",
      "return to base pose",
    ]

    try {
      for (let i = 0; i < 24; i++) {
        console.log(`[v0] Generating animation frame ${i + 1}/24`)

        const referenceImage = i === 0 ? generatedImage : frames[i - 1]
        console.log(`[v0] Using reference image for frame ${i + 1}:`, i === 0 ? "base image" : `previous frame ${i}`)

        const response = await fetch("/api/generate-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: `${prompt} - Animation frame ${i + 1}: ${animationPrompts[i]}`,
            instruments: selectedInstruments,
            style: "animation",
            baseImage: referenceImage, // Pass previous frame as reference
            frameNumber: i + 1,
          }),
        })

        console.log(`[v0] Frame ${i + 1} API response status:`, response.status)

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`[v0] Frame ${i + 1} API error:`, errorText)
          throw new Error(`Failed to generate frame ${i + 1}`)
        }

        const data = await response.json()
        console.log(`[v0] Frame ${i + 1} generated successfully`)
        frames.push(data.imageUrl)

        setAnimationFrames([...frames])
        setAnimationProgress(((i + 1) / 24) * 100)

        if (frames.length === 1) {
          setCurrentFrame(0)
        }
      }

      console.log("[v0] All animation frames generated successfully")
      setIsGeneratingAnimation(false)
      setCurrentStep("music")
      generateMusic()

      toast({
        title: "Animation complete!",
        description: "Now generating your lo-fi soundtrack...",
      })
    } catch (error) {
      console.error("[v0] Error in generateAnimation:", error)
      setIsGeneratingAnimation(false)
      toast({
        title: "Animation generation failed",
        description: "There was an error creating your animation frames",
        variant: "destructive",
      })
    }
  }

  const generateMusic = async () => {
    console.log("[v0] generateMusic called")
    setIsGenerating(true)
    setMusicError(null)

    const generationId = Date.now().toString()
    console.log("[v0] Generation ID:", generationId)

    try {
      const selectedInstrumentLabels = selectedInstruments
        .map((value) => instruments.find((inst) => inst.value === value)?.label.toLowerCase())
        .filter(Boolean)
        .join(", ")

      const lofiPrompt = `Lo-fi chill beats with ${selectedInstrumentLabels}: ${prompt}`
      console.log("[v0] Final prompt for music generation:", lofiPrompt)

      const streamUrl = `/api/generate-music?text=${encodeURIComponent(lofiPrompt)}&duration_seconds=${duration[0]}&prompt_influence=0.3&id=${generationId}`
      console.log("[v0] Music API URL:", streamUrl)

      const response = await fetch(streamUrl)
      console.log("[v0] Music API response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        console.error("[v0] Music API error:", errorData)

        let errorMessage = "There was an error creating your lo-fi session"

        if (errorData.error?.includes("API key")) {
          errorMessage = "Please configure your ElevenLabs API key in Project Settings"
        } else if (errorData.error?.includes("limited_access") || errorData.error?.includes("402")) {
          errorMessage = "Music API requires a paid ElevenLabs plan. You can skip music generation to continue."
        } else if (errorData.details?.includes("limited_access")) {
          errorMessage = "Music API requires a paid ElevenLabs plan. You can skip music generation to continue."
        }

        setMusicError(errorMessage)
        setIsGenerating(false)
        return
      }

      const audio = new Audio(streamUrl)
      audioRef.current = audio

      setAudioUrl(streamUrl)
      console.log("[v0] Audio element created, waiting for canplay event")

      audio.addEventListener("canplay", () => {
        console.log("[v0] Audio canplay event fired - music generation successful")
        setIsGenerating(false)
        setIsPlaying(true)
        audio.play()
        setCurrentStep("complete")
        setSessionComplete(true)
        console.log("[v0] Session completed successfully")
      })

      audio.addEventListener("error", (e) => {
        console.error("[v0] Audio error event:", e)
        setMusicError("There was an error playing your lo-fi session")
        setIsGenerating(false)
      })

      audio.addEventListener("loadstart", () => {
        console.log("[v0] Audio loadstart event - starting to load")
      })

      audio.addEventListener("loadeddata", () => {
        console.log("[v0] Audio loadeddata event - data loaded")
      })

      audio.addEventListener("ended", () => {
        console.log("[v0] Audio playback ended")
        setIsPlaying(false)
      })
    } catch (error) {
      console.error("[v0] Error in generateMusic:", error)
      setMusicError("Please check your API key configuration and try again")
      setIsGenerating(false)
    }
  }

  const skipMusic = () => {
    console.log("[v0] Skipping music generation")
    setMusicError(null)
    setIsGenerating(false)
    setCurrentStep("complete")
    setSessionComplete(true)
    toast({
      title: "Session ready!",
      description: "Your animated lo-fi scene is ready to enjoy (without music)",
    })
  }

  const retryMusic = () => {
    console.log("[v0] Retrying music generation")
    setMusicError(null)
    generateMusic()
  }

  const resetSession = () => {
    setPrompt("")
    setSelectedInstruments(["piano"])
    setDuration([30])
    setAudioUrl(null)
    setGeneratedImage(null)
    setAnimationFrames([])
    setCurrentStep("setup")
    setSessionComplete(false)
    setShowFlowModal(false)
    setIsPlaying(false)
    if (audioRef.current) {
      audioRef.current.pause()
    }
    if (animationRef.current) {
      clearInterval(animationRef.current)
    }
  }

  const shareSession = async () => {
    if (navigator.share) {
      try {
        const instrumentLabels = selectedInstruments
          .map((value) => instruments.find((inst) => inst.value === value)?.label)
          .filter(Boolean)
          .join(", ")

        await navigator.share({
          title: "My Lo-Fi Study Session",
          text: `Check out my custom lo-fi session: "${prompt}" with ${instrumentLabels}`,
          url: window.location.href,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link copied!",
        description: "Share link copied to clipboard",
      })
    }
  }

  const downloadSession = () => {
    if (audioUrl) {
      const link = document.createElement("a")
      link.href = audioUrl
      link.download = `lofi-session-${Date.now()}.mp3`
      link.click()
    }
  }

  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const selectedInstrumentLabels = selectedInstruments
    .map((value) => instruments.find((inst) => inst.value === value)?.label)
    .filter(Boolean)
    .join(", ")

  const currentStepConfig = stepConfig[currentStep]

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {animationFrames.length > 0 && (currentStep === "animation" || currentStep === "complete") ? (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60 transition-all duration-75"
          style={{ backgroundImage: `url(${animationFrames[currentFrame % animationFrames.length]})` }}
        />
      ) : (
        generatedImage && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-60"
            style={{ backgroundImage: `url(${generatedImage})` }}
          />
        )
      )}

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-xl animate-float"></div>
        <div
          className="absolute top-40 right-20 w-24 h-24 bg-secondary/10 rounded-full blur-xl animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-32 left-1/4 w-40 h-40 bg-accent/5 rounded-full blur-xl animate-float"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="relative">
              <Sparkles className="h-10 w-10 text-primary animate-pulse-slow" />
              <div className="absolute inset-0 h-10 w-10 text-primary/30 animate-ping"></div>
            </div>
            <h1 className="text-4xl font-bold text-foreground font-[var(--font-heading)]">Lo-Fi Vibes Generator</h1>
          </div>
          <h2 className="text-5xl font-bold text-foreground mb-4 text-balance font-[var(--font-heading)] bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text [-webkit-text-fill-color:transparent] [background-size:200%_100%] animate-gradient-x">
            Create your custom lo-fi chill session
          </h2>
          <p className="text-muted-foreground text-xl font-[var(--font-body)] max-w-2xl mx-auto leading-relaxed">
            Describe your perfect study vibe and let AI craft the soundtrack to your focus
          </p>
        </div>

        {sessionComplete && (
          <Card className="mb-8 lo-fi-card border-primary/20 bg-card/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-3xl font-[var(--font-heading)] flex items-center gap-3 text-white drop-shadow-lg">
                <Sparkles className="h-8 w-8 text-primary animate-pulse-slow drop-shadow-lg" />
                Your Lo-Fi Session
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-6">
                <div className="text-center">
                  <div className="text-2xl font-medium mb-2 text-white drop-shadow-lg">{prompt || "Untitled Vibe"}</div>
                  <div className="text-white/80 flex items-center justify-center gap-2 drop-shadow-lg">
                    <Music className="h-4 w-4" />
                    {selectedInstrumentLabels} • {duration[0]}s • 24-Frame Animation
                  </div>
                </div>

                <div className="flex items-center justify-center gap-6">
                  <Button
                    onClick={togglePlayback}
                    variant="outline"
                    size="lg"
                    className="w-20 h-20 rounded-full bg-primary/30 border-primary/50 hover:bg-primary/40 hover:scale-110 transition-all duration-300 backdrop-blur-sm"
                  >
                    {isPlaying ? (
                      <Pause className="h-8 w-8 text-white drop-shadow-lg" />
                    ) : (
                      <Play className="h-8 w-8 text-white drop-shadow-lg" />
                    )}
                  </Button>
                </div>

                <div className="flex justify-center gap-3">
                  <Button
                    onClick={shareSession}
                    variant="ghost"
                    size="sm"
                    className="text-white/80 hover:text-white bg-black/20 hover:bg-black/30 backdrop-blur-sm"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  {audioUrl && (
                    <Button
                      onClick={downloadSession}
                      variant="ghost"
                      size="sm"
                      className="text-white/80 hover:text-white bg-black/20 hover:bg-black/30 backdrop-blur-sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  )}
                  <Button
                    onClick={resetSession}
                    variant="ghost"
                    size="sm"
                    className="text-white/80 hover:text-white bg-black/20 hover:bg-black/30 backdrop-blur-sm"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    New Session
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!sessionComplete && (
          <Card className="mb-8 lo-fi-card">
            <CardHeader>
              <CardTitle className="text-2xl font-[var(--font-heading)] flex items-center gap-2">
                <Music className="h-6 w-6 text-primary" />
                Craft Your Vibe
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <label className="text-lg font-medium text-foreground font-[var(--font-body)]">
                  Choose your instruments ({selectedInstruments.length} selected)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {instruments.map((instrument) => (
                    <div
                      key={instrument.value}
                      className="flex items-center space-x-3 p-4 rounded-lg border border-border/50 bg-input/30 hover:bg-input/50 transition-colors"
                    >
                      <Checkbox
                        id={instrument.value}
                        checked={selectedInstruments.includes(instrument.value)}
                        onCheckedChange={(checked) => handleInstrumentChange(instrument.value, checked as boolean)}
                        disabled={sessionComplete}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <label htmlFor={instrument.value} className="flex items-center gap-3 cursor-pointer flex-1">
                        {instrument.icon && <instrument.icon className="h-5 w-5 text-primary" />}
                        <div>
                          <div className="font-medium">{instrument.label}</div>
                          <div className="text-sm text-muted-foreground">{instrument.description}</div>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label htmlFor="prompt" className="text-lg font-medium text-foreground font-[var(--font-body)]">
                  Describe your perfect study session...
                </label>
                <Textarea
                  id="prompt"
                  placeholder="Rainy night studying with soft piano melodies and gentle rain sounds..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={sessionComplete}
                  className="min-h-[140px] resize-none text-lg leading-relaxed font-[var(--font-body)] bg-input/50 backdrop-blur-sm border-border/50 focus:border-primary/50 focus:ring-primary/20"
                  maxLength={100}
                />
                <div className="text-sm text-muted-foreground text-right">{prompt.length}/100 characters</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-lg font-medium text-foreground font-[var(--font-body)]">
                    Session Length: {duration[0]} seconds
                  </label>
                  <Slider
                    value={duration}
                    onValueChange={setDuration}
                    max={60}
                    min={10}
                    step={5}
                    className="w-full"
                    disabled={isGenerating || sessionComplete}
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    onClick={startGeneration}
                    disabled={isGenerating || sessionComplete}
                    className="w-full h-14 text-lg font-semibold font-[var(--font-body)] lo-fi-glow hover:scale-105 transition-all duration-300"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Creating Vibes...
                      </>
                    ) : sessionComplete ? (
                      <>
                        <Check className="mr-2 h-5 w-5" />
                        Session Complete
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        Generate Lo-Fi Session
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!sessionComplete && (
          <div className="text-center mt-16 text-sm text-muted-foreground font-[var(--font-body)]">
            <p className="mb-2">Generated with ❤️ for the lo-fi community</p>
            <p>
              For broad commercial use, read the{" "}
              <a href="#" className="text-primary hover:underline transition-colors">
                terms
              </a>{" "}
              for more details.
            </p>
          </div>
        )}
      </div>

      <Dialog open={showFlowModal && !sessionComplete} onOpenChange={() => {}}>
        <DialogContent className="max-w-2xl bg-card/30 backdrop-blur-md border-border/30">
          <DialogHeader>
            <DialogTitle className="text-2xl font-[var(--font-heading)] flex items-center gap-2">
              {currentStepConfig.icon && <currentStepConfig.icon className="h-6 w-6 text-primary" />}
              {currentStepConfig.title}
            </DialogTitle>
            <DialogDescription>{currentStepConfig.description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="flex justify-between items-center">
              {Object.entries(stepConfig).map(([step, config], index) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      step === currentStep
                        ? "bg-primary text-primary-foreground"
                        : ["scene", "music", "animation", "complete"].indexOf(step) <
                            ["scene", "music", "animation", "complete"].indexOf(currentStep)
                          ? "bg-secondary text-secondary-foreground"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step === currentStep ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : ["scene", "music", "animation", "complete"].indexOf(step) <
                      ["scene", "music", "animation", "complete"].indexOf(currentStep) ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  {index < Object.keys(stepConfig).length - 1 && (
                    <div
                      className={`w-12 h-0.5 mx-2 transition-colors ${
                        ["scene", "music", "animation", "complete"].indexOf(step) <
                        ["scene", "music", "animation", "complete"].indexOf(currentStep)
                          ? "bg-secondary"
                          : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="text-center py-8">
              <div className="w-24 h-24 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
                {currentStep === "scene" && <ImageIcon className="h-12 w-12 text-primary animate-pulse" />}
                {currentStep === "music" && <Music className="h-12 w-12 text-primary animate-pulse" />}
                {currentStep === "animation" && <Film className="h-12 w-12 text-primary animate-pulse" />}
                {currentStep === "complete" && <Sparkles className="h-12 w-12 text-primary" />}
              </div>

              <h3 className="text-xl font-medium mb-2">{currentStepConfig.description}</h3>

              {currentStep === "scene" && !isGeneratingImage && generatedImage && (
                <div className="space-y-4">
                  <p className="text-muted-foreground">How does this study scene look?</p>
                  <div className="flex gap-3 justify-center">
                    <Button onClick={acceptImageAndGenerateAnimation} className="lo-fi-glow">
                      <Check className="h-4 w-4 mr-2" />
                      Accept & Continue
                    </Button>
                    <Button onClick={generateImage} variant="outline">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Regenerate Scene
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === "scene" && isGeneratingImage && (
                <p className="text-muted-foreground">Designing a cozy study environment that matches your vibe...</p>
              )}

              {currentStep === "music" && musicError && (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-destructive font-medium mb-2">Music Generation Failed</p>
                    <p className="text-sm text-muted-foreground mb-4">{musicError}</p>
                    <div className="flex gap-3 justify-center">
                      <Button onClick={retryMusic} variant="outline" className="lo-fi-glow bg-transparent">
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Retry Music
                      </Button>
                      <Button onClick={skipMusic} variant="secondary">
                        <Check className="h-4 w-4 mr-2" />
                        Skip & Continue
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === "music" && !musicError && (
                <p className="text-muted-foreground">
                  Creating your {selectedInstrumentLabels.toLowerCase()} lo-fi track...
                </p>
              )}

              {currentStep === "animation" && (
                <div className="space-y-4">
                  <p className="text-muted-foreground">Adding subtle movements and life to your scene...</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Frame {animationFrames.length} of 24</span>
                      <span>{Math.round(animationProgress)}%</span>
                    </div>
                    <Progress value={animationProgress} className="w-full" />
                    {animationFrames.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Preview updating in background • {animationFrames.length} frames ready
                      </p>
                    )}
                  </div>
                </div>
              )}

              {currentStep === "complete" && (
                <div className="space-y-4">
                  <p className="text-muted-foreground">Your lo-fi study session is ready to enjoy!</p>
                  <Button onClick={() => setShowFlowModal(false)} className="lo-fi-glow">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Start Your Session
                  </Button>
                </div>
              )}
            </div>

            {(generatedImage || animationFrames.length > 0) && currentStep !== "complete" && (
              <div className="relative rounded-lg overflow-hidden">
                <img
                  src={
                    animationFrames.length > 0
                      ? animationFrames[currentFrame % animationFrames.length]
                      : generatedImage || "/placeholder.svg"
                  }
                  alt="Generated lo-fi study scene"
                  className="w-full h-48 object-cover"
                />
                <Badge className="absolute top-2 right-2 bg-primary/90">
                  {animationFrames.length > 0
                    ? `Frame ${(currentFrame % animationFrames.length) + 1}/${animationFrames.length}`
                    : "Preview"}
                </Badge>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
