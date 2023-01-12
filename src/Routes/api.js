const { Router } = require('express');
const auth = require('../Middleware/auth.js');
const { VideoController } = require('../Controllers/VideoController');
const videoController = new VideoController();
const app = Router();

app.use(auth);

app.get('/pingVideoController', async (req, res) => {
    return res.json(responseHandler({
        'data': await videoController.ping()
    }));
});

app.post('/video', (req, res) => {
    const { num, video } = req?.body;

    if (isNaN(+num)) {
        return res.json(responseHandler({
            'message': 'Invalid Size'
        }));
    }

    if (!video.isArray() || video.length != +num) {
        return res.json(responseHandler({
            'message': 'Invalid Video'
        }));
    }

    videoController.createVideo(num, video)
        .then(data => {
            console.log('data', data);
            return res.json(responseHandler({
                'data': data
            }));
        })
        .catch(error => {
            console.log('error', error);
            return res.json(responseHandler({
                'message': 'System Error.'
            }));
        })
});

const responseHandler = (message) => {
    return {
        'code': message?.code || 200,
        'message': message?.message || '',
        'data': message?.data || {},
    };
}

module.exports = app;