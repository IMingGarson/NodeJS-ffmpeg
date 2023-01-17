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

/**
 * 接收製作影片的參數，回傳至做完的影片路徑
 * 
 * @param 
 * @array sequence 影片人物順序，使用 a b c d 分別代表 康康 心心 樂樂 奇奇
 * @array timeline 定義每個人物在每一格的動作
 * 
 * @return
 * @string finalOutputVideo 輸出的影片路徑
 */
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

app.get('/video/download', function(req, res){
    const { filename } = req?.query;

    if (!filename) {
        return res.json(responseHandler({
            'message': 'Invalid Parameter'
        }));
    }

    const file = videoController.getVideoByFileName(filename);
    if (!file) {
        return res.json(responseHandler({
            'message': 'Cannot Find Such File'
        }));
    }

    res.download(file, 'dance.mp4');
});

const responseHandler = (message) => {
    return {
        'code': message?.code || 200,
        'message': message?.message || '',
        'data': message?.data || {},
    };
}

module.exports = app;