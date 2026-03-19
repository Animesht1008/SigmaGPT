import "dotenv/config";

const getOpenAIAPIResponse = async(message) => {
    // =========================
    // LOCALHOST-ONLY (DEV) CODE
    // =========================
    // If you're deploying to production, you typically DO NOT want mock replies.
    //
    // To switch to production:
    // - Comment out the block from "LOCALHOST-ONLY (DEV) CODE" down to "END LOCALHOST-ONLY (DEV) CODE".
    // - Ensure `OPENAI_API_KEY` is set in your production environment.
    //
    // START LOCALHOST-ONLY (DEV) CODE
    const shouldMock = process.env.MOCK_OPENAI === "true";
    if(shouldMock) {
        const safe = (typeof message === "string" ? message.trim() : "").slice(0, 200);
        return `Mock reply (no OpenAI key configured). You said: ${safe || "(empty)"}`;
    }
    // END LOCALHOST-ONLY (DEV) CODE

    if(!process.env.OPENAI_API_KEY) {
        throw new Error("Missing OPENAI_API_KEY (or set MOCK_OPENAI=true)");
    }

    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{
                role: "user",
                content: message
            }]
        })
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", options);
    const data = await response.json().catch(() => ({}));

    if(!response.ok) {
        const msg = data?.error?.message || `OpenAI request failed (${response.status})`;
        throw new Error(msg);
    }

    const content = data?.choices?.[0]?.message?.content;
    if(typeof content !== "string" || !content.trim()) {
        throw new Error("OpenAI returned an empty response");
    }

    return content;
}

export default getOpenAIAPIResponse;