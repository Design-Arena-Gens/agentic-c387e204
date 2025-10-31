# YouTube Video Automation Platform

Generate videos automatically and upload them to YouTube with a simple web interface.

## Features

- **Video Generation**: Create custom videos with text overlays, custom colors, and animations
- **Client-Side Rendering**: Fast video generation using Canvas API and MediaRecorder
- **YouTube Upload Ready**: Structure prepared for YouTube Data API v3 integration
- **Responsive UI**: Modern, clean interface built with Next.js and Tailwind CSS
- **Customization**: Control text, colors, font size, and video duration

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000)

## How It Works

### Video Generation
- Uses HTML5 Canvas API to render frames
- MediaRecorder API captures canvas stream
- Generates WebM video format (browser-compatible)
- Supports text animations (fade in/out)
- Automatic text wrapping for long content

### YouTube Upload (Demo Mode)
Currently runs in demo mode. To enable real YouTube uploads:

1. Create a Google Cloud Project
2. Enable YouTube Data API v3
3. Create OAuth 2.0 credentials
4. Configure environment variables
5. Implement OAuth flow in `/app/api/upload/route.ts`

## Usage

1. **Configure Video**:
   - Enter title and description
   - Add text content to display
   - Customize colors and font size
   - Set video duration (1-60 seconds)

2. **Generate Video**:
   - Click "Generate Video"
   - Preview the generated video
   - Download if needed

3. **Upload to YouTube** (Demo):
   - Fill in YouTube metadata
   - Select privacy status
   - Click "Upload to YouTube"
   - View simulated upload result

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **UI**: React + Tailwind CSS
- **Video**: Canvas API + MediaRecorder
- **API**: Next.js API Routes
- **Type Safety**: TypeScript

## API Endpoints

- `POST /api/generate` - Generate video configuration
- `POST /api/upload` - Upload video to YouTube (demo mode)

## Deployment

Deploy to Vercel:

```bash
vercel deploy --prod
```

## License

MIT
