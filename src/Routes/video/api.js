const { Router } = require('express');
const auth = require('../../Middleware/auth.js');
const { VideoController } = require('../../Controllers/VideoController');
const videoController = new VideoController();
const app = Router();
app.use(auth);

/**
 * @swagger
 * "/video/ping": {
 *  "get": {
 *   "description": "Test VideoController",
 *   "responses": {
 *     "200": {
 *       "description": "Success"
 *     },
 *     "404": {
 *       "description": "Not Found"
 *     },
 *     "502": {
 *       "description": "Server Error"
 *     }
 *   }
 *  }
 * }
 */
app.get('/video/ping', async (req, res) => {
    return res.json(responseHandler({
        'data': await videoController.ping()
    }));
});

/**
 * @swagger
 * "/video": {
 *  "post": {
 *   "description": "Create Video with assigned sequence and timelines",
 *   "consumes": [ "application/json" ],
 *   "produces": ["application/json"],
 *   "requestBody": {
 *     "required": true,
 *     "content": {
 *       "application/json": {
 *         "schema": {
 *           "properities": {
 *             "sequence": {
 *               "type": "array"
 *             },
 *             "timeline": {
 *               "type": "array"
 *             }
 *           }
 *         }
 *       }
 *     },
 *   },
 *   "responses": {
 *     "200": {
 *       "description": "Success"
 *     },
 *     "404": {
 *       "description": "Not Found"
 *     },
 *     "502": {
 *       "description": "Server Error"
 *     }
 *   }
 *  }
 * }
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

    res.download(videoController.getVideoByFileName(fileUUID), '小行星_一起去飛翔.mp4', function (error) {
        if (error) {
            console.error('Download Error', error);
            return res.json(responseHandler({
                'message': 'Cannot Find File'
            }));
        }
    });
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