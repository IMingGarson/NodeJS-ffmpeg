const spawn = require('child_process').spawn;

class VideoController {

    constructor() {
        this.FFMPEG_COMMAND = 'ffmpeg';
    }

    async ping() {
        return 'pong';
    }

    createVideo(num, videos) {
        const fileName = new Date().toISOString();
        let args = [];
        if (num == 1) {
            args = [
                '-i',
                `./assets/videos/${videos[0]}`,
                '-c:v',
                'copy',
                `./assets/videos/${fileName}.mp4`
            ]
        } else if (num == 2) {
            args = [
                [
                    '-vsync',
                    'vfr',
                    '-i',
                    `./assets/videos/${videos[0]}`,
                    '-i',
                    `./assets/videos/${videos[1]}`,
                    '-filter_complex',
                    'hstack=inputs=2',
                    `./assets/videos/${fileName}.mp4`
                ],
            ]
        } else if (num == 3) {
            args = [
                '-vsync',
                'vfr',
                '-i',
                `./assets/videos/${videos[0]}`,
                '-i',
                `./assets/videos/${videos[1]}`,
                '-i',
                `./assets/videos/${videos[2]}`,
                '-filter_complex',
                '[0:v][1:v]vstack=inputs=2[v01];[2:v][v01]hstack=inputs=2',
                `./assets/videos/${fileName}.mp4`
            ];
        } else if (num == 4) {
            args = [
                '-vsync',
                'vfr',
                '-i',
                `./assets/videos/${videos[0]}`,
                '-i',
                `./assets/videos/${videos[1]}`,
                '-i',
                `./assets/videos/${videos[2]}`,
                '-i',
                `./assets/videos/${videos[3]}`,
                '-filter_complex',
                '[0:v][1:v]vstack=inputs=2[v01];[2:v][3:v]vstack=inputs=2[v23];[v01][v23]hstack=inputs=2',
                `./assets/videos/${fileName}.mp4`
            ];
        }

        return new Promise((resolve, rejects) => {
            const proc = spawn(this.FFMPEG_COMMAND, args);
        
            proc.stdout.on('data', function(data) {
                console.log('[STDOUT ON DATA]', data);
            });
    
            proc.stderr.setEncoding("utf8")
    
            proc.stderr.on('data', function(data) {
                console.log('[PROCESS OUTPUT ON DATA]', data);
            });
            
            proc.on('close', function() {
                console.log('[ON CLOSE]');
                // TODO: return video path
                resolve(true);
            });

            proc.on('error', function(error) {
                console.error('createVideo Error: ', error);
                rejects(error);
            });
        });
    }
}

module.exports = {
    VideoController
};