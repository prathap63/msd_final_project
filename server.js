const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = 8010;

const app = http.createServer((req, res) => {
    // Get the requested URL
    let filePath = "";

    // Handle GET requests for HTML pages
    if (req.url === "/" || req.url === "/home") {
        filePath = path.join(__dirname, "index.html");
        serveFile(res, filePath, "text/html");
    } else if (req.url === "/register") {
        filePath = path.join(__dirname, "registration.html");
        serveFile(res, filePath, "text/html");
    } else if (req.url === "/login") {
        filePath = path.join(__dirname, "login.html");
        serveFile(res, filePath, "text/html");
    } else if (req.url === "/options.html") { // Serve options.html
        filePath = path.join(__dirname, "options.html");
        serveFile(res, filePath, "text/html");
    } 
    // Handle POST request from registration form
    else if (req.url === '/registration' && req.method === "POST") {
        let body = "";

        // Collect the form data from the request body
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            const parsedData = new URLSearchParams(body);  // Parse the form data
            
            const username = parsedData.get("username");
            const email = parsedData.get("email");
            const password = parsedData.get("password");

            // Load existing users from the JSON file
            const usersFilePath = path.join(__dirname, 'users.json');
            fs.readFile(usersFilePath, 'utf8', (err, data) => {
                if (err && err.code !== 'ENOENT') {
                    res.writeHead(500, { "Content-Type": "text/plain" });
                    res.end("Error reading users file");
                    return;
                }

                const users = data ? JSON.parse(data) : [];  // Read existing users

                // Check if email already exists
                const userExists = users.find(user => user.email === email);
                if (userExists) {
                    res.writeHead(409, { "Content-Type": "text/plain" });
                    res.end("User with this email already exists!");
                    return;
                }

                // Add new user to the users array
                const newUser = { username, email, password };
                users.push(newUser);

                // Write the updated users array back to the JSON file
                fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (err) => {
                    if (err) {
                        res.writeHead(500, { "Content-Type": "text/plain" });
                        res.end("Error saving user");
                        return;
                    }

                    // Respond with a success message
                    res.writeHead(200, { "Content-Type": "text/plain" });
                    res.end("User successfully registered!");
                });
            });
        });
    } 
    // Handle POST request from login form
    else if (req.url === '/login' && req.method === "POST") {
        let body = "";

        // Collect the form data from the request body
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            const parsedData = new URLSearchParams(body);  // Parse the form data
            
            const email = parsedData.get("email");
            const password = parsedData.get("password");

            // Load existing users from the JSON file
            const usersFilePath = path.join(__dirname, 'users.json');
            fs.readFile(usersFilePath, 'utf8', (err, data) => {
                if (err) {
                    res.writeHead(500, { "Content-Type": "text/plain" });
                    res.end("Error reading users file");
                    return;
                }

                const users = data ? JSON.parse(data) : [];  // Read existing users

                // Check if user exists and password matches
                const user = users.find(user => user.email === email);
                if (user && user.password === password) {
                    // Respond with a redirect to options.html
                    res.writeHead(302, {
                        'Location': '/options.html' // Redirect to options.html
                    });
                    res.end();
                } else {
                    res.writeHead(401, { "Content-Type": "text/plain" });
                    res.end("Invalid email or password");
                }
            });
        });
    } 
    
    // 404 for any other routes
    else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("404 Not Found");
    }
});

// Utility function to serve HTML files
function serveFile(res, filePath, contentType) {
    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Server Error");
        } else {
            res.writeHead(200, { "Content-Type": contentType });
            res.end(content);
        }
    });
}

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
