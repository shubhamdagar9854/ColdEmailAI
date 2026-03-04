const express = require('express');
const path = require('path');
const { pipeline } = require('@xenova/transformers');

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

let generator = null;

async function loadModel() {
    console.log('🔄 Loading Flan-T5-base model (optimized for emails)...');
    generator = await pipeline('text2text-generation', 'Xenova/flan-t5-base');
    console.log('✅ Model loaded successfully!');
}

// Start server only after model loads
async function startServer() {
    try {
        await loadModel();
        app.listen(3000, () => {
            console.log('🚀 Server is running on port 3000');
        });
    } catch (err) {
        console.error('❌ Failed to load model:', err);
        process.exit(1);
    }
}


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/email-preview', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'email-preview.html'));
});
app.post('/submit', async (req, res) => {
    const { your_email, target_email, description } = req.body;

    let generated_email = '';
    if (generator) {
        try {
            const promptText = `Write a professional cold email for a ${description} position. The email should:
- Start with a professional greeting
- Have 2-3 well-structured paragraphs about relevant skills and genuine interest
- Be concise, specific, and compelling
- End with a professional closing and call-to-action
- Sound authentic and personalized, not generic`;
            
            const result = await generator(
                promptText,
                {
                    max_new_tokens: 350,
                    temperature: 0.2,
                    do_sample: false
                }
            );
            
            if (Array.isArray(result) && result[0] && result[0].generated_text) {
                generated_email = result[0].generated_text.trim();
                if (!generated_email || generated_email.length < 30) {
                    generated_email = '';
                }
            }
        } catch (err) {
            generated_email = '';
        }
    }

    if (!generated_email) {
        generated_email = `Dear Hiring Manager,

I am writing to express my strong interest in the ${description} position at your esteemed organization.

With my skills and experience, I am confident in my ability to contribute effectively to your team and help achieve your company's goals.

I would welcome the opportunity to discuss how I can add value to your organization and would be happy to provide any additional information you may require.

Thank you for considering my application.

Best regards,
${your_email}`;
    }

    const subject = `Job Application - ${description}`;
    res.json({
        message: 'Submission received successfully!',
        email: generated_email,
        subject
    });
});

// Start the server
startServer();