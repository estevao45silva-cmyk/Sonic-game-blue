const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.text());
app.post('/log-error', (req, res) => {
    console.log('BROWSER ERROR:', req.body);
    res.sendStatus(200);
});
app.listen(9999, () => console.log('Error logger listening on 9999'));
