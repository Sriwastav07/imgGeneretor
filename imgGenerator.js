console.log("JS file is loaded");
function showLoading() {
  document.querySelectorAll(".status-container").forEach(el => {
    el.classList.remove("hidden");
  });
}

function hideLoading() {
  document.querySelectorAll(".status-container").forEach(el => {
    el.classList.add("hidden");
  });
}

function simulateGeneration() {
  showLoading();
  setTimeout(() => {
    hideLoading();
  }, 3000); // Simulates 3s generation time
}

function setTheme() {
  const icon = document.getElementById('theme-icon');
  document.documentElement.classList.toggle('dark');

   if (document.documentElement.classList.contains('dark')) {
    icon.classList.add('fa-sun');
    icon.classList.remove('fa-moon');
  } else {
    icon.classList.add('fa-moon');
    icon.classList.remove('fa-sun');
  }
}

document.addEventListener("DOMContentLoaded", () => {
const promptForm = document.querySelector(".prompt-form");
const promptInput = document.querySelector(".prompt-input");
const promptBtn = document.querySelector(".prompt-btn");
const countSelect = document.getElementById("count-select");
const gridGallery = document.querySelector(".gallery-grid");
const API_KEY = "";  //deepai API key

const examplePrompts = [
"A magic forest with glowing plants and fairy homes among giant mushrooms",
"An old steampunk airship floating through golden clouds at sunset",
"A future Mars colony with glass domes and gardens against red mountains",
"A dragon sleeping on gold coins in a crystal cave",
"An underwater kingdom with merpeople and glowing coral buildings",
"A floating island with waterfalls pouring into clouds below",
"A witch's cottage in fall with magic herbs in the garden",
"A robot painting in a sunny studio with art supplies around it",
"A magical library with floating glowing books and spiral staircases",
"A Japanese shrine during cherry blossom season with lanterns and misty mountains",
"A cosmic beach with glowing sand and an aurora in the night sky",
"A medieval marketplace with colorful tents and street performers",
"A cyberpunk city with neon signs and flying cars at night",
"A peaceful bamboo forest with a hidden ancient temple",
"A giant turtle carrying a village on its back in the ocean",
];

// FIXED: Generate multiple images instead of just one
const generateImages = async (imageCount, promptText) => {
  console.log("🌐 Sending to backend:", promptText, "Count:", imageCount);

  // Generate images for each card
  for (let i = 0; i < imageCount; i++) {
    try {
      const response = await fetch("http://localhost:3000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptText })
      });

      // Check if response is OK
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`🧠 Backend Response for image ${i + 1}:`, data);
      
      // More flexible image URL detection
      let imageUrl = null;
      if (data.image) {
        imageUrl = data.image;
      } else if (data.url) {
        imageUrl = data.url;
      } else if (data.output_url) {
        imageUrl = data.output_url;
      } else if (data.data && data.data.length > 0) {
        // For APIs that return array of results
        imageUrl = data.data[0].url || data.data[0].image;
      } else if (data.images && data.images.length > 0) {
        // Handle your backend's response format
        const imageObj = data.images[i] || data.images[0]; // Use index i for multiple images
        if (typeof imageObj === 'string') {
          imageUrl = imageObj;
        } else if (imageObj && imageObj.url) {
          imageUrl = imageObj.url;
        }
      }
      
      console.log(`🖼️ Extracted image URL for image ${i + 1}:`, imageUrl);

      if (imageUrl) {
        // Target the specific image card
        const imgCard = document.getElementById(`img-card-${i}`);
        if (imgCard) {
          const imgElement = imgCard.querySelector(".res-img");
          if (imgElement) {
            imgElement.src = imageUrl;
            imgElement.onload = () => {
              hideLoadingForImage(i);
            };
            imgElement.onerror = () => {
              throw new Error("Failed to load image");
            };
          }
        }
      } else {
        console.error(`❌ No image URL found in response:`, data);
        throw new Error("No image URL found in response");
      }
    } catch (error) {
      console.error(`❌ Image ${i + 1} failed:`, error.message);
      // Show error state in the specific card
      const imgCard = document.getElementById(`img-card-${i}`);
      if (imgCard) {
        const statusContainer = imgCard.querySelector(".status-container");
        const statusText = imgCard.querySelector(".status-text");
        if (statusText) {
          statusText.textContent = "Failed to generate";
          statusText.style.color = "red";
        }
        // Keep the loading container visible to show error
      }
    }
  }
};

// ENHANCED: Better image card creation with individual loading states
const createImageCards = (imageCount, promptText) => {
  gridGallery.innerHTML = "";
  console.log("🧱 createImageCards called with:", { imageCount, promptText });

  for(let i = 0; i < imageCount; i++){
    gridGallery.innerHTML += `<div class="img-card loading relative w-[210px] hover:transition duration-300 ease-in-out transform hover:-translate-y-1 group shadow-lg rounded-xl overflow-hidden" id="img-card-${i}">
                      <div class="status-container absolute inset-0 bg-white/80 z-10 flex flex-col items-center justify-center">
                          <div class="spinner mb-2"></div>
                          <p class="status-text text-sm text-gray-700">Generating image ${i + 1}...</p>
                      </div>
                      <img src="" class="res-img h-full w-[95%] object-cover rounded-xl">
                      <div class="img-overlay absolute bottom-0 right-0 mr-5 bg-stone-600 mb-3 opacity-0 group-hover:opacity-50 rounded-full hover:transition duration-300 ease-in-out transform hover:-translate-y-1 pointer-events-none group-hover:pointer-events-auto">
                          <button class="img-download-btn h-[40px] w-[40px] backdrop-grayscale-200 text-white" onclick="downloadImage(${i})">
                              <i class="fa-solid fa-download"></i>
                          </button>
                      </div>
                  </div>`;
  }

  generateImages(imageCount, promptText);
};

// OPTIONAL: Add download functionality
window.downloadImage = function(index) {
  const imgCard = document.getElementById(`img-card-${index}`);
  if (imgCard) {
    const img = imgCard.querySelector(".res-img");
    if (img && img.src) {
      const link = document.createElement('a');
      link.href = img.src;
      link.download = `generated-image-${index + 1}.jpg`;
      link.click();
    }
  }
};

// ENHANCED: Better loading management for individual images
const hideLoadingForImage = (index) => {
  const imgCard = document.getElementById(`img-card-${index}`);
  if (imgCard) {
    const statusContainer = imgCard.querySelector(".status-container");
    if (statusContainer) {
      statusContainer.classList.add("hidden");
    }
  }
};

// Handle form submission 
const handleFormSubmit = (e) => {
  console.log("🚀 handleFormSubmit triggered");
  e.preventDefault();
  
  const imageCount = parseInt(countSelect.value) || 1;
  const promptText = promptInput.value.trim();

  if (!promptText) {
    alert("Please enter a prompt");
    return;
  }

  createImageCards(imageCount, promptText);
  gridGallery.classList.remove("hidden");
  // Remove simulateGeneration() since we're handling loading per image now
};

// Fill prompt input with random example
promptBtn.addEventListener("click", () => {
  const prompt = examplePrompts[Math.floor(Math.random()*examplePrompts.length)];
  promptInput.value = prompt;
  promptInput.focus();
});

promptForm.addEventListener("submit", handleFormSubmit);
});
