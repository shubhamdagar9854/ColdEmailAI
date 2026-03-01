const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/submit', (req, res) => {
    const { your_email, target_email, description } = req.body || {};
    
    console.log('Form data:', { your_email, target_email, description });
    
    if (!your_email || !target_email || !description) {
        return res.status(400).json({
            error: 'All fields required!',
            received: { your_email, target_email, description }
        });
    }
    const generated_email = "hello sir";

    res.json({
        success: true,
        email: generated_email,
        received: { your_email, target_email, description }
    });
});


app.listen(3000, () => {
    console.log('Server is running on port 3000');
});