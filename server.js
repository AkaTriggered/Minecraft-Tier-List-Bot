const express = require('express');
const path = require('path');
const app = express();
const PORT = 21454;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve loading.html as the initial page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'loading.html'));
});

// Redirect to '/index.html' after loading (you may need to adjust the delay)
app.get('/redirect', (req, res) => {
    setTimeout(() => {
        res.redirect('/index.html');
    }, 2000); // 2 seconds delay, adjust as needed
});

// Handle 404 Not Found
app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
});

// Keep the server alive by listening to a route
app.get('/keepalive', (req, res) => {
    res.send('Server is alive!');
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});