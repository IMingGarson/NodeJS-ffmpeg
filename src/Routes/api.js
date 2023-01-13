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

app.post('/video', async (req, res) => {

    const { sequence, timeline } = req?.body;

    if (!sequence) {
        return res.json(responseHandler({
            'message': 'Invalid Parameter'
        }));
    }

    if (!timeline) {
        return res.json(responseHandler({
            'message': 'Invalid Parameter'
        }));
    }

    // create each frame data for the whole video
    const clipTxt = await videoController.createFrame(sequence, timeline);
    if (!clipTxt) {
        return res.json(responseHandler({
            'message': 'Fail to generate frame data'
        }));
    }

    const finalOutputVideo = await videoController.createVideo(clipTxt);
    if (!finalOutputVideo) {
        return res.json(responseHandler({
            'message': 'Fail to generate video data'
        }));
    }

    return res.json(responseHandler({
        'data': finalOutputVideo
    }));
});

const responseHandler = (message) => {
    return {
        'code': message?.code || 200,
        'message': message?.message || '',
        'data': message?.data || {},
    };
}

module.exports = app;