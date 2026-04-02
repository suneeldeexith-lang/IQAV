const multer = require('multer');

// Configure multer to use memory storage
// This is necessary because we will immediately pipe the buffer to Supabase Storage
const storage = multer.memoryStorage();

// Set limits or file filters as needed
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB limit per file
    }
});

module.exports = upload;
