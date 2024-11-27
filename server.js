const app = require("./app"); // Import the Express app
const http = require("http");

const dotenv = require("dotenv");

dotenv.config();

const server = http.createServer(app);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
