const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/success', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'success.html'));
});
app.post('/submit', (req, res) => {
    const { your_email, target_email, description } = req.body;
    console.log(`Received submission: Your Email: ${your_email}, Target Email: ${target_email}, Description: ${description}`);
    res.json({ message: 'Submission received successfully!' });
});



app.listen(3000, () => {
    console.log('Server is running on port 3000');
});