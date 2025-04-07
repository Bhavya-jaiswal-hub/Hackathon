// controllers/userInfoController.js
const handleUserInfo = (req, res) => {
    const { age, gender } = req.body;
  
    if (!age || !gender) {
      return res.status(400).json({ error: "Age and gender are required" });
    }
  
    // You can store it in a database later – for now, just respond back
    res.status(200).json({
      message: "User info received successfully",
      data: { age, gender },
    });
  };
  
  module.exports = { handleUserInfo };
  