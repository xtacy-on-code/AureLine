const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); 

const app = express();
// behind Vercel's proxy, so req.ip is the real client for rate limiting
app.set('trust proxy', 1);
app.use(cors());
app.use(express.json());

// test route
app.get('/', (req, res) => {
    res.json({ message: 'AureLine API is running' });
});

// connect database (reused across requests on serverless)
let dbConnection = null;
const connectDB = () => {
    if (!dbConnection) {
        dbConnection = mongoose.connect(process.env.MONGODB_URI)
            .then(() => console.log('MONGODB connected'))
            .catch(err => {
                dbConnection = null;
                throw err;
            });
    }
    return dbConnection;
};

app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error('MONGODB error: ', err);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

// auth route (mounted first, the routers below require a login for everything)
const authRouter = require('./src/routes/auth');
app.use('/api/auth', authRouter);

// landing page demo, no login
const demoRouter = require('./src/routes/demo');
app.use('/api/demo', demoRouter);

// upload route
const uploadRouter = require('./src/routes/upload');
app.use('/api', uploadRouter);

// history and saved documents
const documentsRouter = require('./src/routes/documents');
app.use('/api', documentsRouter);

// start server (only when run directly, Vercel imports the app instead)
if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;