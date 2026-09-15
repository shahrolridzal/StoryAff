const fetch = global.fetch;


/*
====================================================
STORYAFF AI SERVICE
====================================================
*/


const STORY_STYLES = {

    personal_story: `
Write the post like a genuine personal experience.

Start with a relatable situation.
Build a short story.
Introduce the product naturally.
Do not sound like an advertisement.
End with a soft recommendation.
`,

    problem_solution: `
Start with a real everyday problem.

Make the reader recognize the problem.
Then introduce the product as a practical solution.
Explain why it helps.
Finish with a natural CTA.
`,

    curiosity: `
Create curiosity immediately.

Make the reader want to continue reading.
Do not reveal the product benefit immediately.
Build anticipation.
Reveal the useful part naturally.
`,

    funny: `
Use casual Malaysian humour.

The story should feel like something a Malaysian would tell a friend.
Use light humour.
Do not overuse emojis.
Keep the product integration natural.
`,

    discovery: `
Write as if the writer accidentally discovered something useful.

Start with:
"I didn't expect..."
or
"I just found out..."

Create a small discovery story.
Then explain why the product is useful.
`,

    baru_tahu: `
Use the Malaysian conversational style:

"Aku baru tahu..."

Create a short story around discovering something useful.
Make the reader feel like they learned something too.
`,

    travel_story: `
Write a travel-related mini story.

The product should solve a realistic travel problem.
Use Malaysian traveller context.
Make it feel like a genuine travel tip rather than an advertisement.
`,

    comparison: `
Compare the product with the usual way people solve the problem.

Explain the difference simply.
Do not make unsupported claims.
End with a practical recommendation.
`,

    mini_review: `
Write a short honest-style review.

Mention:
- what is useful
- who might like it
- possible limitation if relevant

Do not invent specifications or personal experiences that were not provided.
`,

    soft_sell: `
Make the post extremely natural.

The reader should feel they discovered a useful product rather than being sold something.

Use storytelling.
Keep the selling pressure low.
End with a simple CTA.
`
};


/*
====================================================
MAIN FUNCTION
====================================================
*/

async function generateStory(options) {

    const {

        productName,
        productDescription = "",
        category = "",
        price = "",
        rating = "",
        audience = "Malaysian consumers",
        language = "Malay",
        tone = "casual",
        storyStyle = "personal_story",
        platform = "Threads",
        affiliateLink = "",
        affiliateDisclosure = "Pautan affiliate — saya mungkin menerima komisen kecil jika anda membeli melalui link ini.",
        previousPosts = []

    } = options;


    if (!productName) {

        throw new Error("productName is required");

    }


    const styleInstruction =
        STORY_STYLES[storyStyle] ||
        STORY_STYLES.personal_story;


    const previousPostsText =
        previousPosts.length > 0
            ? previousPosts.join("\n---\n")
            : "No previous posts available.";


    const systemPrompt = `

You are StoryAff AI.

You are an expert social media storytelling writer
for affiliate marketing.

Your job is NOT to write obvious advertisements.

Your job is to create short, engaging,
natural storytelling content that can be posted
on Threads.

TARGET PLATFORM:
${platform}

TARGET AUDIENCE:
${audience}

LANGUAGE:
${language}

TONE:
${tone}

IMPORTANT RULES:

1. Never fabricate product specifications.

2. Never fabricate prices.

3. Never fabricate personal experiences.

4. Never claim the writer personally bought or used
the product unless the input explicitly says so.

5. Do not use fake testimonials.

6. Do not make medical, financial or dangerous claims.

7. Avoid exaggerated claims such as:
"100% guaranteed",
"best product ever",
"must buy",
unless supported by actual data.

8. Keep the storytelling conversational.

9. Avoid sounding like a corporate advertisement.

10. Use Malaysian conversational language when
the requested language is Malay.

11. The affiliate link must be included exactly
as provided.

12. Do not modify the affiliate URL.

13. Include an honest affiliate disclosure.

14. Do not use more than 5 hashtags.

15. Do not repeat previous posts.

16. Avoid generic AI phrases.

17. The first sentence must create curiosity
or immediately establish a relatable situation.

STORY STYLE:

${styleInstruction}

PREVIOUS POSTS:

${previousPostsText}

RETURN ONLY VALID JSON.

The JSON structure must be:

{
  "hook": "",
  "story": "",
  "cta": "",
  "affiliate_disclosure": "",
  "hashtags": [],
  "full_post": ""
}

`;


    const userPrompt = `

PRODUCT INFORMATION

Product:
${productName}

Category:
${category}

Description:
${productDescription}

Price:
${price}

Rating:
${rating}

Affiliate URL:
${affiliateLink}

Affiliate disclosure:
${affiliateDisclosure}

Create one Threads post using the selected storytelling style.

The post should be useful, entertaining and natural.

Do not invent information that is not provided.

`;


    const provider =
        process.env.AI_PROVIDER || "gemini";


    if (provider === "openrouter") {

        return await generateWithOpenRouter(
            systemPrompt,
            userPrompt
        );

    }


    return await generateWithGemini(
        systemPrompt,
        userPrompt
    );

}


/*
====================================================
GEMINI
====================================================
*/

async function generateWithGemini(
    systemPrompt,
    userPrompt
) {

    const apiKey =
        process.env.GEMINI_API_KEY;

    if (!apiKey) {

        throw new Error(
            "GEMINI_API_KEY is missing"
        );

    }


    const model =
        process.env.GEMINI_MODEL ||
        "gemini-3.6-flash";


    const url =
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;


    const response = await fetch(url, {

        method: "POST",

        headers: {

            "Content-Type":
                "application/json",

            "x-goog-api-key":
                apiKey

        },

        body: JSON.stringify({

            systemInstruction: {

                parts: [

                    {
                        text: systemPrompt
                    }

                ]

            },

            contents: [

                {

                    role: "user",

                    parts: [

                        {
                            text: userPrompt
                        }

                    ]

                }

            ],

            generationConfig: {

                responseMimeType:
                    "application/json"

            }

        })

    });


    const data =
        await response.json();


    if (!response.ok) {

        console.error(
            "Gemini error:",
            JSON.stringify(data, null, 2)
        );

        throw new Error(
            data?.error?.message ||
            "Gemini API request failed"
        );

    }


    const text =
        data?.candidates?.[0]
            ?.content?.parts?.[0]
            ?.text;


    if (!text) {

        throw new Error(
            "Gemini returned empty response"
        );

    }


    return parseAIJson(text);

}


/*
====================================================
OPENROUTER
====================================================
*/

async function generateWithOpenRouter(
    systemPrompt,
    userPrompt
) {

    const apiKey =
        process.env.OPENROUTER_API_KEY;

    if (!apiKey) {

        throw new Error(
            "OPENROUTER_API_KEY is missing"
        );

    }


    const model =
        process.env.OPENROUTER_MODEL ||
        "openrouter/free";


    const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {

            method: "POST",

            headers: {

                "Authorization":
                    `Bearer ${apiKey}`,

                "Content-Type":
                    "application/json",

                "X-Title":
                    "StoryAff AI"

            },

            body: JSON.stringify({

                model: model,

                messages: [

                    {
                        role: "system",
                        content: systemPrompt
                    },

                    {
                        role: "user",
                        content: userPrompt
                    }

                ],

                response_format: {

                    type: "json_object"

                }

            })

        }
    );


    const data =
        await response.json();


    if (!response.ok) {

        console.error(
            "OpenRouter error:",
            JSON.stringify(data, null, 2)
        );

        throw new Error(
            data?.error?.message ||
            "OpenRouter API request failed"
        );

    }


    const text =
        data?.choices?.[0]
            ?.message
            ?.content;


    if (!text) {

        throw new Error(
            "OpenRouter returned empty response"
        );

    }


    return parseAIJson(text);

}


/*
====================================================
SAFE JSON PARSER
====================================================
*/

function parseAIJson(text) {

    let clean = text.trim();


    /*
    Remove markdown code fences
    if model accidentally returns them.
    */

    clean = clean
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();


    try {

        return JSON.parse(clean);

    } catch (error) {

        console.error(
            "Invalid AI JSON:",
            clean
        );

        throw new Error(
            "AI returned invalid JSON"
        );

    }

}


module.exports = {

    generateStory,

    STORY_STYLES

};