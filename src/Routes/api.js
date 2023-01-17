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
    const materialPath = await videoController.createFrame(sequence, timeline);
    if (!materialPath) {
        return res.json(responseHandler({
            'message': 'Fail to generate frame data'
        }));
    }

    const fileUUID = await videoController.createVideo(materialPath);
    if (!fileUUID) {
        return res.json(responseHandler({
            'message': 'Fail to generate video data'
        }));
    }

    return res.json(responseHandler({
        'data': fileUUID
    }));
});

app.get('/video/download', function(req, res){
    const { filename } = req?.query;

    if (!filename) {
        return res.json(responseHandler({
            'message': 'Invalid Parameter'
        }));
    }

    res.download(videoController.getVideoByFileName(filename), 'dance.mp4', function (error) {
        if (error) {
            console.error('Download Error', error);
            return res.json(responseHandler({
                'message': 'Cannot Find File'
            }));
        }
    });
});

const responseHandler = (message) => {
    return {
        'code': message?.code || 200,
        'message': message?.message || '',
        'data': message?.data || {},
    };
}

module.exports = app;