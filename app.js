const express = require('express');
const path = require('path');
const { pipeline } = require('@xenova/transformers');

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

let generator = null;
async function loadModel() {
    console.log('🔄 Loading DistilGPT2 model...');
    generator = await pipeline('text-generation', 'Xenova/distilgpt2');
    console.log('✅ Model loaded successfully!');
}
loadModel().catch(console.error);


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/email-preview', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'email-preview.html'));
});
app.post('/submit', async (req, res) => {
    const { your_email, target_email, description } = req.body;
    console.log(`Received submission: Your Email: ${your_email}, Target Email: ${target_email}, Description: ${description}`);

    let generated_email = '';
    if (generator) {
        try {
            const promptText = `Write a professional cold email for a job application in this role: ${description}`;
            const result = await generator(
                promptText,
                {
                    max_new_tokens: 120,
                    temperature: 0.7,
                    do_sample: true,
                    pad_token_id: 50256,
                    return_full_text: false
                }
            );
            if (Array.isArray(result) && result[0] && result[0].generated_text) {
                generated_email = result[0].generated_text.trim();
                // remove prompt if somehow included
                if (generated_email.startsWith(promptText)) {
                    generated_email = generated_email.slice(promptText.length).trim();
                }
            }
        } catch (err) {
            console.error('AI generation failed:', err);
        }
    }

    if (!generated_email) {
        console.log('⚠️ Using fallback template');
        generated_email = `Subject: Job Application for ${description}\n\nDear Hiring Manager,\n\nI am writing to express my strong interest in the ${description} position.\n\nBest regards,\n${your_email}`;
    }

    const subject = `Job Application for ${description}`;
    console.log('🚀 Sending back generated email:', generated_email.replace(/\n/g,'\\n'));
    res.json({
        message: 'Submission received successfully!',
        email: generated_email,
        subject
    });
});



app.listen(3000, () => {
    console.log('Server is running on port 3000');
});