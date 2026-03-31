// Configuration
const OPENAI_MODEL = "gpt-4o-mini";
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const REQUEST_TIMEOUT = 30000; // 30 seconds
const IS_PRODUCTION = process.env.NODE_ENV === "production";

/**
 * Get AI response from OpenAI API with full conversation context
 * @param {Array} messages - Array of {role, content} objects representing conversation history
 * @returns {Promise<string>} AI response text
 */
const getOpenAIAPIResponse = async(messages) => {
    // =========================
    // DEVELOPMENT: Mock Mode
    // =========================
    // When MOCK_OPENAI=true, return mock responses without using OpenAI API
    // Useful for: local development, testing, avoiding costs
    //
    // START DEV CODE
    const shouldMock = process.env.MOCK_OPENAI === "true";
    if(shouldMock) {
        const lastMessage = Array.isArray(messages) ? messages[messages.length - 1]?.content : messages;
        const safe = (typeof lastMessage === "string" ? lastMessage.trim() : "").slice(0, 200);
        return `[Mock Response] You said: "${safe || "(empty)"}" — Switch MOCK_OPENAI to false and set OPENAI_API_KEY to use the real API.`;
    }
    // END DEV CODE

    // Validate configuration
    if(!process.env.OPENAI_API_KEY) {
        throw new Error("Missing OPENAI_API_KEY environment variable (or set MOCK_OPENAI=true for development)");
    }

    // Ensure messages is an array of {role, content} objects
    const messageArray = Array.isArray(messages) ? messages : [{role: "user", content: messages}];

    // Validate message array format
    if (!Array.isArray(messageArray) || messageArray.length === 0) {
        throw new Error("Messages must be a non-empty array");
    }

    // Prepare OpenAI API request
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: OPENAI_MODEL,
            messages: messageArray,
            temperature: 0.7, // Balanced creativity vs consistency
        })
    };

    try {
        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

        const response = await fetch(OPENAI_API_URL, {
            ...options,
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        // Parse response
        const data = await response.json().catch(() => ({}));

        // Handle API errors
        if(!response.ok) {
            const errorMsg = data?.error?.message || `OpenAI API error (${response.status})`;
            
            // Log detailed error in development
            if (!IS_PRODUCTION) {
                console.error(`[OpenAI Error] Status: ${response.status}, Message: ${errorMsg}`);
            }
            
            throw new Error(errorMsg);
        }

        // Extract content from response
        const content = data?.choices?.[0]?.message?.content;
        if(typeof content !== "string" || !content.trim()) {
            throw new Error("OpenAI returned an empty or invalid response");
        }

        return content;

    } catch (err) {
        // Handle timeout
        if (err.name === "AbortError") {
            throw new Error("OpenAI request timeout");
        }
        
        // Re-throw with context
        throw err;
    }
}

export default getOpenAIAPIResponse;