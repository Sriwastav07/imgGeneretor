// server.mjs
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Main endpoint - Generate multiple images
app.post("/generate", async (req, res) => {
  const { prompt, count = 4, width = 512, height = 512, model = "flux" } = req.body;
  console.log("📩 Received prompt:", prompt, "| Count:", count);

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const encodedPrompt = encodeURIComponent(prompt);
    const images = [];
    
    // Generate multiple images with different seeds
    for (let i = 0; i < count; i++) {
      const seed = Math.floor(Math.random() * 1000000);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&model=${model}`;
      
      images.push({
        url: imageUrl,
        seed: seed,
        index: i + 1
      });
    }
    
    console.log("✅ Generated", count, "images");
    res.json({ 
      images: images,
      count: count,
      success: true,
      provider: "pollinations",
      parameters: {
        prompt: prompt,
        width: width,
        height: height,
        model: model
      }
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Single image endpoint (for backward compatibility)
app.post("/generate-single", async (req, res) => {
  const { prompt, width = 512, height = 512, model = "flux" } = req.body;
  console.log("📩 Single image prompt:", prompt);

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const encodedPrompt = encodeURIComponent(prompt);
    const seed = Math.floor(Math.random() * 1000000);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&model=${model}`;
    
    console.log("✅ Generated single image");
    res.json({ 
      image: imageUrl,
      success: true,
      provider: "pollinations"
    });
  } catch (error) {
    console.error("❌ Single image error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Grid generation - Different variations of the same prompt
app.post("/generate-grid", async (req, res) => {
  const { prompt, count = 9, width = 512, height = 512 } = req.body;
  console.log("📩 Grid generation:", prompt, "| Count:", count);

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const images = [];
    const models = ["flux", "turbo", "flux-realism"];
    
    for (let i = 0; i < count; i++) {
      const model = models[i % models.length];
      const seed = Math.floor(Math.random() * 1000000);
      const encodedPrompt = encodeURIComponent(prompt);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&model=${model}`;
      
      images.push({
        url: imageUrl,
        seed: seed,
        model: model,
        index: i + 1
      });
    }
    
    console.log("✅ Generated grid of", count, "images");
    res.json({ 
      images: images,
      count: count,
      success: true,
      provider: "pollinations-grid",
      layout: "grid"
    });
  } catch (error) {
    console.error("❌ Grid Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Root endpoint for testing
app.get("/", (req, res) => {
  res.json({ 
    message: "Image Generation Server is running!",
    endpoints: [
      "POST /generate - Generate multiple images (default: 4)",
      "POST /generate-single - Generate single image",
      "POST /generate-grid - Generate grid with different models",
      "GET /health - Health check"
    ]
  });
});

// Handle 404s
app.use((req, res) => {
  res.status(404).json({ 
    error: "Endpoint not found",
    available_endpoints: [
      "POST /generate",
      "POST /generate-single",
      "POST /generate-grid",
      "GET /health",
      "GET /"
    ]
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   POST /generate - Generate multiple images (default: 4)`);
  console.log(`   POST /generate-single - Generate single image`);
  console.log(`   POST /generate-grid - Generate grid with different models`);
  console.log(`   GET /health - Health check`);
  console.log(`   GET / - Root endpoint`);
  console.log(`\n🎉 Ready to generate images!`);
  console.log(`\nExample: Generate 6 images`);
  console.log(`curl -X POST http://localhost:3000/generate \\`);
  console.log(`  -H "Content-Type: application/json" \\`);
  console.log(`  -d '{"prompt": "A magical library", "count": 6}'`);
});