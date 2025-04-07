const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.post("/api/userinfo", (req, res) => {
  const { age, gender } = req.body;

  if (!age || !gender) {
    return res.status(400).json({ message: "Age and gender are required" });
  }

  res.status(200).json({
    message: "User info received successfully",
    data: { age, gender },
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
