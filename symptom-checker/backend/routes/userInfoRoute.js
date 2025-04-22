    // routes/userInfoRoute.js
    const express = require("express");
    const router = express.Router();
    const { handleUserInfo } = require("../controllers/userInfoController");

    router.post("/userinfo", handleUserInfo);

    module.exports = router;
