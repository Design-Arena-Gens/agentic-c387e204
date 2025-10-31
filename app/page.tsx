'use client'

import { useState } from 'react'

export default function Home() {
  const [videoConfig, setVideoConfig] = useState({
    title: '',
    description: '',
    text: '',
    backgroundColor: '#1a1a2e',
    textColor: '#ffffff',
    fontSize: 48,
    duration: 5
  })

  const [uploadConfig, setUploadConfig] = useState({
    title: '',
    description: '',
    tags: '',
    privacyStatus: 'private'
  })

  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const generateVideo = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      // Generate video client-side using Canvas and MediaRecorder
      const canvas = document.createElement('canvas')
      canvas.width = 1920
      canvas.height = 1080
      const ctx = canvas.getContext('2d')!

      const stream = canvas.captureStream(30) // 30 fps
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 2500000
      })

      const chunks: BlobPart[] = []
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data)

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' })
        const url = URL.createObjectURL(blob)
        setGeneratedVideo(url)
        setIsGenerating(false)

        // Auto-fill upload config
        setUploadConfig(prev => ({
          ...prev,
          title: prev.title || videoConfig.title,
          description: prev.description || videoConfig.description
        }))
      }

      mediaRecorder.start()

      // Animate frames
      const fps = 30
      const totalFrames = videoConfig.duration * fps
      let frame = 0

      const animate = () => {
        if (frame >= totalFrames) {
          mediaRecorder.stop()
          return
        }

        // Draw background
        ctx.fillStyle = videoConfig.backgroundColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Draw text with animation
        ctx.fillStyle = videoConfig.textColor
        ctx.font = `bold ${videoConfig.fontSize}px Arial`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        // Simple fade in/out animation
        const progress = frame / totalFrames
        let opacity = 1
        if (progress < 0.1) {
          opacity = progress / 0.1
        } else if (progress > 0.9) {
          opacity = (1 - progress) / 0.1
        }

        ctx.globalAlpha = opacity

        // Word wrap text
        const words = videoConfig.text.split(' ')
        const lines: string[] = []
        let currentLine = ''

        words.forEach(word => {
          const testLine = currentLine + word + ' '
          const metrics = ctx.measureText(testLine)
          if (metrics.width > canvas.width - 200 && currentLine) {
            lines.push(currentLine)
            currentLine = word + ' '
          } else {
            currentLine = testLine
          }
        })
        lines.push(currentLine)

        // Draw lines
        const lineHeight = videoConfig.fontSize * 1.4
        const startY = (canvas.height - lines.length * lineHeight) / 2

        lines.forEach((line, i) => {
          ctx.fillText(line.trim(), canvas.width / 2, startY + i * lineHeight)
        })

        ctx.globalAlpha = 1
        frame++
        setTimeout(animate, 1000 / fps)
      }

      animate()

    } catch (err: any) {
      setError(err.message)
      setIsGenerating(false)
    }
  }

  const uploadToYouTube = async () => {
    if (!generatedVideo) {
      setError('Please generate a video first')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      // Convert blob URL to blob
      const response = await fetch(generatedVideo)
      const blob = await response.blob()

      const formData = new FormData()
      formData.append('video', blob, 'video.mp4')
      formData.append('title', uploadConfig.title)
      formData.append('description', uploadConfig.description)
      formData.append('tags', uploadConfig.tags)
      formData.append('privacyStatus', uploadConfig.privacyStatus)

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json()
        throw new Error(errorData.error || 'Failed to upload video')
      }

      const result = await uploadResponse.json()
      setUploadResult(result)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">YouTube Video Automation</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Video Generator */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">1. Generate Video</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={videoConfig.title}
                  onChange={(e) => setVideoConfig({...videoConfig, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="My Awesome Video"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={videoConfig.description}
                  onChange={(e) => setVideoConfig({...videoConfig, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Video description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Video Text</label>
                <textarea
                  value={videoConfig.text}
                  onChange={(e) => setVideoConfig({...videoConfig, text: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Text to display in video..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                  <input
                    type="color"
                    value={videoConfig.backgroundColor}
                    onChange={(e) => setVideoConfig({...videoConfig, backgroundColor: e.target.value})}
                    className="w-full h-10 rounded border border-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
                  <input
                    type="color"
                    value={videoConfig.textColor}
                    onChange={(e) => setVideoConfig({...videoConfig, textColor: e.target.value})}
                    className="w-full h-10 rounded border border-gray-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Font Size</label>
                  <input
                    type="number"
                    value={videoConfig.fontSize}
                    onChange={(e) => setVideoConfig({...videoConfig, fontSize: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="12"
                    max="120"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (seconds)</label>
                  <input
                    type="number"
                    value={videoConfig.duration}
                    onChange={(e) => setVideoConfig({...videoConfig, duration: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="60"
                  />
                </div>
              </div>

              <button
                onClick={generateVideo}
                disabled={isGenerating || !videoConfig.text}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                {isGenerating ? 'Generating...' : 'Generate Video'}
              </button>
            </div>
          </div>

          {/* Upload to YouTube */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">2. Upload to YouTube</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Video Title</label>
                <input
                  type="text"
                  value={uploadConfig.title}
                  onChange={(e) => setUploadConfig({...uploadConfig, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="YouTube video title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Video Description</label>
                <textarea
                  value={uploadConfig.description}
                  onChange={(e) => setUploadConfig({...uploadConfig, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={3}
                  placeholder="YouTube video description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={uploadConfig.tags}
                  onChange={(e) => setUploadConfig({...uploadConfig, tags: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="tag1, tag2, tag3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Privacy Status</label>
                <select
                  value={uploadConfig.privacyStatus}
                  onChange={(e) => setUploadConfig({...uploadConfig, privacyStatus: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="private">Private</option>
                  <option value="unlisted">Unlisted</option>
                  <option value="public">Public</option>
                </select>
              </div>

              <button
                onClick={uploadToYouTube}
                disabled={isUploading || !generatedVideo || !uploadConfig.title}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                {isUploading ? 'Uploading...' : 'Upload to YouTube'}
              </button>

              {uploadResult && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm font-medium text-green-800">Upload Successful!</p>
                  <p className="text-sm text-green-700 mt-1">Video ID: {uploadResult.videoId}</p>
                  {uploadResult.videoUrl && (
                    <a
                      href={uploadResult.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline mt-1 inline-block"
                    >
                      View on YouTube
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preview */}
        {generatedVideo && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Preview</h2>
            <video
              src={generatedVideo}
              controls
              className="w-full max-w-2xl mx-auto rounded-lg"
            />
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm font-medium text-red-800">Error</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Setup Instructions</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700">
            <li>Create a Google Cloud Project and enable YouTube Data API v3</li>
            <li>Create OAuth 2.0 credentials (Desktop application type)</li>
            <li>Download the credentials JSON and save as <code className="bg-blue-100 px-1 rounded">credentials.json</code> in the project root</li>
            <li>Set environment variable: <code className="bg-blue-100 px-1 rounded">GOOGLE_CREDENTIALS_PATH=./credentials.json</code></li>
            <li>The first upload will prompt for OAuth authorization</li>
          </ol>
        </div>
      </div>
    </main>
  )
}
