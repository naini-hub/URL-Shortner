const express = require('express');
const app = express();
const path = require('path');

const URL = require('./models/url');
const {connectToMongoDB} = require("./connect");


const staticRoute = require('./routes/staticRouter');
const urlRoute = require('./routes/url');
// const userRoute = require('./routes/user');

const PORT = 8001;

app.set('view engine', 'ejs');
app.set('views',path.resolve("./views"));


connectToMongoDB('mongodb://localhost:27017/short-url')
.then(() => console.log('MongoDB connected'))

app.use(express.json()); 
app.use(express.urlencoded({extended: false}));

app.use("/url", urlRoute);
app.use('/', staticRoute);
// app.use('/user',userRoute);


app.get('/url/:shortId',async (req, res) =>{
    const shortId = req.params.shortId;
    try {
        const entry = await URL.findOneAndUpdate(
            { shortId },
            { $push: { visitHistory: { timestamp: Date.now() } } },
            { new: true } // This option returns the modified document
        );
        if (!entry) {
            return res.status(404).send('URL not found');
        }
        res.redirect(entry.redirectURL);
    } catch (error) {
        console.error('Error fetching URL entry:', error);
        res.status(500).send('Internal Server Error');
    }
});
app.listen(PORT, () => {console.log(`Server Started at PORT: ${PORT}`)});

