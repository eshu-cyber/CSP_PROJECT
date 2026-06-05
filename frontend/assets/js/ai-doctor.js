// Gemini API Configuration
// -----------------------------------------------------------
// LOCAL DEVELOPMENT: paste your key below (never commit it!)
// VERCEL DEPLOYMENT: set GEMINI_API_KEY in Vercel dashboard
//   → vercel.com > Project > Settings > Environment Variables
// -----------------------------------------------------------
// For local testing only — paste your key here, do NOT commit this line
// Get a key at: https://makersuite.google.com/app/apikey
const GEMINI_API_KEY_LOCAL = 'YOUR_LOCAL_GEMINI_API_KEY';

const GEMINI_MODEL = 'gemini-2.5-flash';

// Auto-detect: use the secure Vercel proxy when deployed,
// fall back to calling Gemini directly on localhost.
const IS_LOCAL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const GEMINI_API_URL = IS_LOCAL
    ? `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY_LOCAL}`
    : '/api/chat';  // Vercel serverless proxy — key stays on server

// System prompt to make Gemini act as a doctor
const SYSTEM_PROMPT = `You are Dr. AI, a professional and empathetic medical assistant specializing in injury assessment, fractures, sprains, and general health advice. 

IMPORTANT RULES:
1. ONLY answer questions related to health, medical conditions, injuries, symptoms, and wellness
2. If asked about non-medical topics (politics, entertainment, technology, etc.), politely redirect: "I'm a medical assistant and can only help with health-related questions. Do you have any concerns about injuries, pain, or your health?"
3. Always provide accurate, helpful medical information
4. Use a warm, professional tone with appropriate emojis (🩺💊🏥)
5. Always remind users to seek professional medical care for serious conditions
6. Never provide specific medication dosages - always say "consult your doctor for proper dosage"
7. Be concise but thorough in your responses
8. Show empathy and understanding

Your expertise includes:
- Fractures vs sprains identification
- First aid and R.I.C.E method
- Pain and swelling management
- When to seek emergency care
- Injury prevention
- General health and wellness advice

Respond naturally and conversationally while maintaining medical professionalism.`;

// Fallback responses for common questions (used when API fails)
const fallbackResponses = {
    fracture: "Signs of a fracture include:\n\n• Severe pain that worsens with movement\n• Visible deformity or unusual angle\n• Inability to bear weight\n• Swelling and bruising\n• Grinding sensation\n\nIf you suspect a fracture, immobilize the area and seek immediate medical attention! 🏥",
    sprain: "A sprain involves stretched or torn ligaments. Symptoms include:\n\n• Pain and tenderness\n• Swelling\n• Bruising\n• Limited range of motion\n• Popping sensation at time of injury\n\nTreat with R.I.C.E method and see a doctor if severe! 🩹",
    rice: "R.I.C.E stands for:\n\n🧊 Rest - Avoid using the injured area\n❄️ Ice - Apply ice for 15-20 minutes every 2-3 hours\n🔄 Compression - Use elastic bandage to reduce swelling\n⬆️ Elevation - Keep injured area above heart level\n\nThis helps reduce pain and swelling in the first 48-72 hours!",
    emergency: "Go to the ER immediately if you experience:\n\n🚨 Severe pain or deformity\n🚨 Inability to move the injured area\n🚨 Numbness or tingling\n🚨 Bone protruding through skin\n🚨 Heavy bleeding\n🚨 Signs of infection (fever, red streaks)\n\nDon't wait - your health is priority #1!",
    difference: "Key differences between fracture and sprain:\n\n**Fracture (Broken Bone):**\n• Severe, sharp pain\n• Visible deformity\n• Cannot bear weight at all\n• Grinding or cracking sound\n• Bone may protrude\n\n**Sprain (Ligament Injury):**\n• Moderate to severe pain\n• Swelling and bruising\n• May be able to bear some weight\n• Popping sensation\n• No visible deformity\n\nWhen in doubt, get an X-ray! 🩻"
};

// Health quotes collection
const healthQuotes = [
    "An apple a day keeps the doctor away, but if the doctor is cute, forget the fruit! 🍎",
    "Health is not valued until sickness comes. - Thomas Fuller 💪",
    "Take care of your body. It's the only place you have to live. - Jim Rohn 🏃",
    "The greatest wealth is health. - Virgil 💎",
    "To keep the body in good health is a duty... otherwise we shall not be able to keep our mind strong and clear. - Buddha 🧘",
    "Your body hears everything your mind says. Stay positive! ✨",
    "Sleep is the best meditation. - Dalai Lama 😴",
    "Movement is medicine. Get active today! 🚴",
    "Drink water like it's your job! Stay hydrated! 💧",
    "Laughter is the best medicine... unless you have diarrhea! 😂"
];

// Health facts collection
const healthFacts = [
    "Your bones are 4 times stronger than concrete! 🦴",
    "The human body has enough iron to make a 3-inch nail! 🔩",
    "Your heart beats about 100,000 times a day! ❤️",
    "You have about 206 bones in your adult body! 🦴",
    "Your nose can remember 50,000 different scents! 👃",
    "Bones are constantly being remodeled throughout your life! 🔄",
    "A fracture can start healing within hours of injury! ⚡",
    "Your funny bone isn't actually a bone - it's a nerve! 😄",
    "Children have more bones than adults (about 300)! 👶",
    "Your body produces 25 million new cells each second! 🔬"
];

// AI responses database
const aiResponses = {
    "fracture": {
        keywords: ["fracture", "broken bone", "break", "crack"],
        response: "Signs of a fracture include:\n\n• Severe pain that worsens with movement\n• Visible deformity or unusual angle\n• Inability to bear weight\n• Swelling and bruising\n• Grinding sensation\n\nIf you suspect a fracture, immobilize the area and seek immediate medical attention! 🏥"
    },
    "sprain": {
        keywords: ["sprain", "twisted", "rolled ankle", "ligament"],
        response: "A sprain involves stretched or torn ligaments. Symptoms include:\n\n• Pain and tenderness\n• Swelling\n• Bruising\n• Limited range of motion\n• Popping sensation at time of injury\n\nTreat with R.I.C.E method and see a doctor if severe! 🩹"
    },
    "rice": {
        keywords: ["rice", "r.i.c.e", "treatment", "first aid"],
        response: "R.I.C.E stands for:\n\n🧊 Rest - Avoid using the injured area\n❄️ Ice - Apply ice for 15-20 minutes every 2-3 hours\n🔄 Compression - Use elastic bandage to reduce swelling\n⬆️ Elevation - Keep injured area above heart level\n\nThis helps reduce pain and swelling in the first 48-72 hours!"
    },
    "emergency": {
        keywords: ["emergency", "er", "hospital", "urgent", "serious"],
        response: "Go to the ER immediately if you experience:\n\n🚨 Severe pain or deformity\n🚨 Inability to move the injured area\n🚨 Numbness or tingling\n🚨 Bone protruding through skin\n🚨 Heavy bleeding\n🚨 Signs of infection (fever, red streaks)\n\nDon't wait - your health is priority #1!"
    },
    "pain": {
        keywords: ["pain", "hurt", "ache", "sore"],
        response: "For pain management:\n\n💊 Over-the-counter pain relievers (follow dosage)\n🧊 Ice for acute injuries (first 48 hours)\n🔥 Heat for chronic pain or stiffness\n🧘 Gentle stretching and movement\n😴 Adequate rest\n\nIf pain persists or worsens, consult a healthcare provider!"
    },
    "swelling": {
        keywords: ["swelling", "swollen", "inflammation", "puffy"],
        response: "To reduce swelling:\n\n⬆️ Elevate the injured area above heart level\n🧊 Apply ice (15-20 min, every 2-3 hours)\n🔄 Use compression bandage\n💧 Stay hydrated\n🚫 Avoid heat in first 48 hours\n\nSwelling is your body's natural response to injury. It should improve within a few days!"
    },
    "healing": {
        keywords: ["heal", "recovery", "how long", "time"],
        response: "Healing times vary:\n\n🦴 Fractures: 6-8 weeks (sometimes longer)\n🩹 Sprains: 2-6 weeks depending on severity\n💪 Muscle strains: 2-4 weeks\n\nFactors affecting healing:\n• Age and overall health\n• Severity of injury\n• Following treatment plan\n• Nutrition and rest\n\nPatience is key! 🌱"
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    rotateHealthContent();
    setInterval(rotateHealthContent, 30000); // Change every 30 seconds

    // Initialize reveal animations
    initRevealAnimations();
});

// Rotate health quotes and facts
function rotateHealthContent() {
    const randomQuote = healthQuotes[Math.floor(Math.random() * healthQuotes.length)];
    const randomFact = healthFacts[Math.floor(Math.random() * healthFacts.length)];

    document.getElementById('health-quote').textContent = randomQuote;
    document.getElementById('health-fact').textContent = randomFact;
}

// Handle enter key press
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Send message
async function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();

    if (!message) return;

    // Add user message
    addMessage(message, 'user');
    input.value = '';

    // Hide quick suggestions after first message
    document.getElementById('quick-suggestions').style.display = 'none';

    // Show typing indicator
    showTypingIndicator();

    // Try to get AI response, use fallback if it fails
    try {
        console.log('Attempting to contact Gemini API...');
        const response = await getGeminiResponseWithFallback(message);
        hideTypingIndicator();
        addMessage(response, 'ai');
    } catch (error) {
        console.error('Error in sendMessage:', error);
        hideTypingIndicator();
        const fallback = getSmartFallback(message);
        addMessage(fallback, 'ai');
    }
}

// Get response with fallback
async function getGeminiResponseWithFallback(userMessage) {
    try {
        // Try API first with a short timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await getGeminiResponse(userMessage, controller.signal);
        clearTimeout(timeoutId);
        console.log(`Gemini response generated by ${GEMINI_MODEL}`);
        return response;
    } catch (error) {
        console.log('Gemini API failed:', error.message);
        return getServiceUnavailableMessage();
    }
}

function getServiceUnavailableMessage() {
    return "I'm having trouble connecting to the live AI medical assistant right now. Please try again in a moment. If this is urgent, seek care from a qualified healthcare professional or emergency services.";
}

// Smart fallback that analyzes the question
function getSmartFallback(message) {
    const lowerMessage = message.toLowerCase();

    // Check if question is non-medical (skincare, beauty, etc.)
    const nonMedicalKeywords = ['skin care', 'skincare', 'beauty', 'makeup', 'cosmetic', 'fashion', 'politics', 'sports', 'movie', 'music', 'game', 'recipe', 'cooking'];
    if (nonMedicalKeywords.some(keyword => lowerMessage.includes(keyword))) {
        return "I'm a medical assistant specializing in injury assessment and musculoskeletal health. 👨⚕️\n\nI can only help with health-related questions about:\n• Injuries and fractures\n• Sprains and strains\n• Pain management\n• When to seek medical care\n• First aid advice\n\nFor skincare, beauty, or other topics, I recommend consulting appropriate specialists. Do you have any injury or health concerns I can help with?";
    }

    // Check for keywords and return appropriate response
    if (lowerMessage.includes('fracture') || lowerMessage.includes('broken') || lowerMessage.includes('break')) {
        return fallbackResponses.fracture;
    }
    if (lowerMessage.includes('sprain') || lowerMessage.includes('twist') || lowerMessage.includes('rolled')) {
        return fallbackResponses.sprain;
    }
    if (lowerMessage.includes('rice') || lowerMessage.includes('r.i.c.e')) {
        return fallbackResponses.rice;
    }
    if (lowerMessage.includes('emergency') || lowerMessage.includes('er') || lowerMessage.includes('hospital') || lowerMessage.includes('urgent')) {
        return fallbackResponses.emergency;
    }
    if (lowerMessage.includes('difference') || lowerMessage.includes('vs') || lowerMessage.includes('tell apart')) {
        return fallbackResponses.difference;
    }
    if (lowerMessage.includes('pain')) {
        return "For pain management:\n\n💊 Over-the-counter pain relievers (follow dosage instructions)\n🧊 Ice for acute injuries (first 48 hours)\n🔥 Heat for chronic pain or stiffness\n🧘 Gentle stretching and movement\n😴 Adequate rest\n\nIf pain persists or worsens, consult a healthcare provider! 👨‍⚕️";
    }
    if (lowerMessage.includes('swell')) {
        return "To reduce swelling:\n\n⬆️ Elevate the injured area above heart level\n🧊 Apply ice (15-20 min, every 2-3 hours)\n🔄 Use compression bandage\n💧 Stay hydrated\n🚫 Avoid heat in first 48 hours\n\nSwelling is your body's natural response to injury. It should improve within a few days!";
    }
    if (lowerMessage.match(/\b(hi|hello|hey|greetings)\b/)) {
        return "Hello! 👋 I'm Dr. AI, here to help with your health questions. What would you like to know about injuries, fractures, or sprains?";
    }
    if (lowerMessage.match(/\b(thank|thanks|appreciate)\b/)) {
        return "You're welcome! 😊 Feel free to ask if you have any other questions. Your health is important! Remember, if you have serious concerns, please consult a healthcare professional.";
    }

    // Default response
    return "I'm here to help with injury-related questions! 🩺\n\nYou can ask me about:\n• Fractures vs sprains\n• First aid and R.I.C.E method\n• When to seek emergency care\n• Pain and swelling management\n• Healing and recovery\n\nWhat would you like to know?\n\n💡 For general health topics like skincare, nutrition, or fitness, I recommend consulting with appropriate specialists. I specialize in injury assessment and musculoskeletal health!";
}

// Send quick message
async function sendQuickMessage(message) {
    document.getElementById('chat-input').value = message;
    await sendMessage();
}

// Send sticker
async function sendSticker(sticker) {
    addMessage(sticker, 'user', true);

    showTypingIndicator();

    try {
        const response = await getGeminiResponse(`I sent you this emoji: ${sticker}. Please respond briefly and friendly.`);
        hideTypingIndicator();
        addMessage(response, 'ai');
    } catch (error) {
        hideTypingIndicator();
        const responses = [
            "Great choice! How can I help you today? 😊",
            "I see you! What's on your mind? 👀",
            "Nice! What health questions do you have? 💭",
            "Got it! Feel free to ask me anything! 🎯"
        ];
        const response = responses[Math.floor(Math.random() * responses.length)];
        addMessage(response, 'ai');
    }
}

// Add message to chat
function addMessage(text, sender, isSticker = false) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');

    if (sender === 'user') {
        messageDiv.className = 'flex gap-3 items-start justify-end';
        messageDiv.innerHTML = `
            <div class="flex-1 flex flex-col items-end">
                <div class="bg-primary-container p-4 rounded-2xl rounded-tr-none max-w-md ${isSticker ? 'text-5xl' : ''}">
                    <p class="font-body-md text-body-md text-on-primary ${isSticker ? 'text-center' : ''}">${text}</p>
                </div>
                <p class="font-body-sm text-body-sm text-on-surface-variant mt-1 mr-2">Just now</p>
            </div>
            <div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span class="material-symbols-outlined text-primary">person</span>
            </div>
        `;
    } else {
        messageDiv.className = 'flex gap-3 items-start';
        messageDiv.innerHTML = `
            <div class="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-2xl flex-shrink-0">
                👨⚕️
            </div>
            <div class="flex-1">
                <div class="bg-surface-container-high p-4 rounded-2xl rounded-tl-none max-w-md">
                    <p class="font-body-md text-body-md text-on-surface whitespace-pre-line">${text}</p>
                </div>
                <p class="font-body-sm text-body-sm text-on-surface-variant mt-1 ml-2">Just now</p>
            </div>
        `;
    }

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show typing indicator
function showTypingIndicator() {
    const chatMessages = document.getElementById('chat-messages');
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typing-indicator';
    typingDiv.className = 'flex gap-3 items-start';
    typingDiv.innerHTML = `
        <div class="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-2xl flex-shrink-0">
            👨⚕️
        </div>
        <div class="bg-surface-container-high p-4 rounded-2xl rounded-tl-none">
            <div class="flex gap-1">
                <div class="w-2 h-2 bg-on-surface-variant rounded-full animate-bounce" style="animation-delay: 0ms"></div>
                <div class="w-2 h-2 bg-on-surface-variant rounded-full animate-bounce" style="animation-delay: 150ms"></div>
                <div class="w-2 h-2 bg-on-surface-variant rounded-full animate-bounce" style="animation-delay: 300ms"></div>
            </div>
        </div>
    `;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Hide typing indicator
function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Get response from Gemini API
async function getGeminiResponse(userMessage, signal = null) {
    try {
        const requestBody = {
            contents: [{
                parts: [{
                    text: `${SYSTEM_PROMPT}\n\nUser: ${userMessage}\n\nDr. AI:`
                }]
            }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            },
            safetySettings: [
                {
                    category: "HARM_CATEGORY_HARASSMENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_HATE_SPEECH",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                }
            ]
        };

        const fetchOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        };

        if (signal) {
            fetchOptions.signal = signal;
        }

        // On Vercel the proxy at /api/chat forwards to Gemini with the server-side key
        const response = await fetch(GEMINI_API_URL, fetchOptions);

        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error Details:', errorData);

            // Check for specific error types
            if (errorData.error) {
                if (errorData.error.code === 400) {
                    console.error('API Key Error: The API key may be invalid, expired, or restricted.');
                    console.log('Get a new API key at: https://makersuite.google.com/app/apikey');
                } else if (errorData.error.code === 403) {
                    console.error('Permission Error: API key doesn\'t have permission or quota exceeded.');
                } else if (errorData.error.code === 429) {
                    console.error('Rate Limit: Too many requests. Please wait and try again.');
                }
            }

            throw new Error(`API request failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        console.log('API Response received successfully');

        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else if (data.error) {
            console.error('API returned error:', data.error);
            throw new Error(data.error.message || 'API error');
        } else {
            throw new Error('Invalid response format');
        }
    } catch (error) {
        console.error('Gemini API Error:', error);
        throw error;
    }
}

// Generate AI response (fallback - no longer used)
function generateAIResponse(message) {
    const lowerMessage = message.toLowerCase();

    // Check for matching keywords
    for (const [key, data] of Object.entries(aiResponses)) {
        if (data.keywords.some(keyword => lowerMessage.includes(keyword))) {
            return data.response;
        }
    }

    // Greeting responses
    if (lowerMessage.match(/\b(hi|hello|hey|greetings)\b/)) {
        return "Hello! 👋 I'm here to help with your health questions. What would you like to know about injuries, fractures, or sprains?";
    }

    // Thank you responses
    if (lowerMessage.match(/\b(thank|thanks|appreciate)\b/)) {
        return "You're welcome! 😊 Feel free to ask if you have any other questions. Your health is important!";
    }

    // Default response
    return "I'm here to help with injury-related questions! 🩺\n\nYou can ask me about:\n• Fractures vs sprains\n• First aid and R.I.C.E method\n• When to seek emergency care\n• Pain and swelling management\n• Healing and recovery\n\nWhat would you like to know?";
}

// Clear chat
function clearChat() {
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML = `
        <div class="flex gap-3 items-start">
            <div class="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-2xl flex-shrink-0">
                👨⚕️
            </div>
            <div class="flex-1">
                <div class="bg-surface-container-high p-4 rounded-2xl rounded-tl-none max-w-md">
                    <p class="font-body-md text-body-md text-on-surface">
                        Hello! I'm Dr. AI, your virtual health assistant powered by advanced AI. 👋
                    </p>
                    <p class="font-body-md text-body-md text-on-surface mt-2">
                        I can help you with:
                    </p>
                    <ul class="mt-2 space-y-1 font-body-sm text-body-sm text-on-surface-variant">
                        <li>• Injury assessment and symptoms</li>
                        <li>• Fractures vs sprains identification</li>
                        <li>• First aid and treatment advice</li>
                        <li>• When to seek emergency care</li>
                        <li>• General health questions</li>
                    </ul>
                    <p class="font-body-sm text-body-sm text-on-surface-variant mt-3 italic">
                        💡 I'm specialized in health topics only. Ask me anything about your health!
                    </p>
                </div>
                <p class="font-body-sm text-body-sm text-on-surface-variant mt-1 ml-2">Just now</p>
            </div>
        </div>
    `;
    document.getElementById('quick-suggestions').style.display = 'block';
}

// Reveal animations
function initRevealAnimations() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        document.querySelectorAll('.reveal').forEach((el) => {
            revealObserver.observe(el);
        });
    } else {
        document.querySelectorAll('.reveal').forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
    }
}
