require("dotenv").config();

const express = require("express");
const cors = require("cors");

const {
    generateStory,
    STORY_STYLES
} = require("./services/aiService");


const app = express();

app.use(cors());

app.use(express.json());


const PORT =
    process.env.PORT || 3000;


/*
====================================================
HOME
====================================================
*/

app.get("/", (req, res) => {

    res.json({

        success: true,

        app: "StoryAff AI",

        version: "1.0.0",

        status: "online"

    });

});


/*
====================================================
HEALTH
====================================================
*/

app.get("/health", (req, res) => {

    res.json({

        success: true,

        status: "healthy",

        aiProvider:
            process.env.AI_PROVIDER ||
            "gemini",

        timestamp:
            new Date().toISOString()

    });

});


/*
====================================================
GET STORY STYLES
====================================================
*/

app.get("/api/ai/styles", (req, res) => {

    res.json({

        success: true,

        styles: Object.keys(
            STORY_STYLES
        )

    });

});


/*
====================================================
GENERATE STORY
====================================================
*/

app.post("/api/ai/generate", async (req, res) => {

    try {

        const result =
            await generateStory(
                req.body
            );


        res.json({

            success: true,

            data: result

        });


    } catch (error) {

        console.error(
            "AI GENERATION ERROR:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                error.message ||
                "AI generation failed"

        });

    }

});


/*
====================================================
TEST STORY
====================================================
*/

app.get("/api/ai/test", async (req, res) => {

    try {

        const result =
            await generateStory({

                productName:
                    "Mini Portable Fan",

                productDescription:
                    "Small portable fan suitable for travel and everyday use.",

                category:
                    "Travel",

                price:
                    "RM29.90",

                rating:
                    "4.8",

                audience:
                    "Malaysian travellers",

                language:
                    "Malay",

                tone:
                    "casual Malaysian",

                storyStyle:
                    "travel_story",

                platform:
                    "Threads",

                affiliateLink:
                    "https://example.com/affiliate"

            });


        res.json({

            success: true,

            data: result

        });


    } catch (error) {

        console.error(error);


        res.status(500).json({

            success: false,

            message:
                error.message

        });

    }

});


/*
====================================================
THREADS STATUS
====================================================
*/

app.get(
    "/api/threads/status",
    (req, res) => {

        res.json({

            success: true,

            connected:
                !!process.env
                    .THREADS_ACCESS_TOKEN

        });

    }
);


/*
====================================================
PRODUCTS
====================================================
*/

app.get(
    "/api/products",
    (req, res) => {

        res.json({

            success: true,

            products: []

        });

    }
);


/*
====================================================
404
====================================================
*/

app.use(
    (req, res) => {

        res.status(404).json({

            success: false,

            message:
                "Endpoint not found"

        });

    }
);


/*
====================================================
START SERVER
====================================================
*/

app.listen(
    PORT,
    () => {

        console.log("");

        console.log(
            "===================================="
        );

        console.log(
            "         STORYAFF AI"
        );

        console.log(
            "===================================="
        );

        console.log("");

        console.log(
            `Server running on port ${PORT}`
        );

        console.log(
            `http://localhost:${PORT}`
        );

        console.log("");

        console.log(
            "AI Provider:",
            process.env.AI_PROVIDER ||
            "gemini"
        );

        console.log("");

    }
);