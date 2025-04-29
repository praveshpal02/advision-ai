# **App Name**: AdVision AI

## Core Features:

- Reference Ad Upload: Upload a reference ad image and optional text description to kickstart the ad generation process.
- AI-Powered Ad Copy Generation: Leverage a tool powered by GPT-4 to generate ad copy variations (headline, subheadline, CTA) based on the uploaded reference ad, brand guidelines (colors, style words, target audience), and selected output format. 
- Ad Variation Preview: Display multiple ad variations in a preview format, allowing users to zoom in, inspect, download, or copy the output.

## Style Guidelines:

- Primary color: Clean white or light gray for a professional feel.
- Secondary color: Muted blue (#3498db) to convey trust and innovation.
- Accent: Teal (#008080) for buttons and highlights to draw attention.
- Clean, card-based layouts for ad variation previews.
- Simple, clear icons for actions like 'download', 'copy', and 'zoom'.

## Original User Request:
AI Ad Generator – Project Blueprint (Next.js 15 App Router)
✅ 1. Tech Stack

Layer	Tech/Library
Framework	Next.js 15 (App Router)
Styling	Tailwind CSS
State Management	Context API / Zustand / Redux Toolkit
AI Models	OpenAI GPT-4, DALL·E / Stable Diffusion
Image Analysis	OpenAI Vision / Replicate
Upload & Storage	Cloudinary / Firebase Storage / Vercel Blob
Preview & Canvas	HTML5 Canvas / Fabric.js
Auth (Optional)	NextAuth.js
✅ 2. Directory Structure
bash
Copy
Edit
/app
  /upload                 → Upload reference ad
  /generate               → Generate ad(s)
  /preview                → Display variations
  /api
    /analyze              → Extract brand features
    /generate-copy        → GPT-4 for text generation
    /generate-image       → DALL·E / Stable Diffusion API
/components
  BrandInputSection.jsx
  UploadBox.jsx
  FormatSelector.jsx
  AdPreviewCard.jsx
  InstructionsBox.jsx
  VariationsPanel.jsx
/lib
  analyzeImage.ts         → Vision model helpers
  generateText.ts         → GPT-based helpers
  generateImage.ts        → Image generation API calls
  utils.ts
/context
  BrandContext.js
/public
  (placeholder assets)
/styles
  globals.css
README.md
✅ 3. Core Features
📌 A. Upload Reference Ad
📷 Image Upload UI (accepts PNG, JPG)

📝 Optional text description of the ad

🧠 API: Extract style, colors, layout, font via Vision model

📌 B. Input Brand Guidelines
🎨 Color palette input (hex codes or picker)

🧬 Style words (e.g., “playful”, “luxury”, “modern”)

👥 Target audience (age, interests)

🖋 Font name (optional manual input)

📌 C. Generate Ad(s)
💬 Text Ad Generation:

Headline, Subheadline, CTA

GPT prompt dynamically constructed using extracted & manual inputs

🖼 Visual Ad Generation:

Use DALL·E or Stable Diffusion API

Prompt includes colors, format, theme

🔁 Multiple Variations: 3–5 options by default

✏️ Optional Prompt Tweaking (e.g., “Make it more formal”)

📌 D. Preview & Selection
🖼 Variation previews (cards with visual + text)

🔍 Zoom-in / inspect

✅ Download or Copy output

✅ 4. API Routes (Edge Functions / Serverless)

Endpoint	Description
POST /api/analyze	Extract brand elements from uploaded ad
POST /api/generate-copy	Generate ad copy using GPT-4
POST /api/generate-image	Generate visuals with DALL·E/Stable Diff.
POST /api/iterate-copy	Modify existing copy with new instructions
✅ 5. UI Flow
Landing Page: Welcome + CTA to upload reference

Step 1: Upload Ad: Upload + preview + confirm

Step 2: Add Brand Info: Colors, style, voice

Step 3: Choose Output Format: e.g., IG Post, Banner, Email

Step 4: Generate: Button triggers async API process

Step 5: Preview & Edit: See multiple variations, tweak, download

✅ 6. Example API Payloads
Text Generation:

json
Copy
Edit
{
  "referenceText": "Get 20% off all summer items!",
  "brandStyle": "casual and energetic",
  "colors": ["#FF5733", "#FFD700"],
  "tone": "playful",
  "format": "Instagram Post"
}
Image Generation Prompt (DALL·E):

json
Copy
Edit
{
  "prompt": "Design an Instagram ad for a playful, youthful fashion brand using orange and yellow colors, featuring summer clothes and energetic text layout",
  "size": "1024x1024"
}
✅ 7. Backend Notes
Use OpenAI Vision (if eligible) or Replicate to analyze uploaded ad

Store uploads temporarily in Cloudinary / Firebase

Combine extracted tone + manual inputs into unified GPT prompt

Use DALL·E API for visual generation with prompt engineering

✅ 8. Deliverables for Submission

Item	Description
README.md	Setup, usage, model design explanation
demo.mp4	Walkthrough of upload → generate → preview
source code	Public GitHub repo
architecture.md	Describe modular pipeline + API model flow

create next js project
  