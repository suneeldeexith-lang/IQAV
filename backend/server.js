// Load environment variables first
require('dotenv').config();

const app = require('./app');
const prisma = require('./src/config/prisma');
const supabase = require('./src/config/supabase');

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
    try {
       await prisma.$connect();
       console.log('Database connected');

       const { data, error } = await supabase.storage.getBucket(process.env.SUPABASE_BUCKET_NAME || 'course-files');
       if (error && error.message && error.message.includes('fetch')) {
            throw new Error('Supabase network configuration incorrect');
       }
       console.log('Supabase connected');
       console.log('Prisma ready');
       console.log('Server started');
       console.log(`Server running on port ${PORT}`);
    } catch (error) {
       console.error('Fatal: Server configuration missing or disconnected:', error.message || error);
       process.exit(1);
    }
});
