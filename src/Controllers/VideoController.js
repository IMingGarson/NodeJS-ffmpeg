const { rejects } = require('assert');
const { resolve } = require('path');

const spawn = require('child_process').spawn;

class VideoController {

    constructor() {
        this.FFMPEG_COMMAND = 'ffmpeg';
        this.ONE_VID_ARGS = [
            '-i',
            './assets/videos/1.mp4',
            '-c:v',
            'copy',
            './assets/videos/' + new Date().toISOString() + '.mp4'
        ];
        this.TWO_VID_ARGS = [
            '-vsync',
            'vfr',
            '-i',
            './assets/videos/1.mp4',
            '-i',
            './assets/videos/2.mp4',
            '-filter_complex',
            'hstack=inputs=2',
            './assets/videos/' + new Date().toISOString() + '.mp4'
        ];
        this.THREE_VID_ARGS = [
            '-vsync',
            'vfr',
            '-i',
            './assets/videos/1.mp4',
            '-i',
            './assets/videos/2.mp4',
            '-i',
            './assets/videos/1280x1440.mp4',
            '-filter_complex',
            '[0:v][1:v]vstack=inputs=2[v01];[2:v][v01]hstack=inputs=2',
            './assets/videos/' + new Date().toISOString() + '.mp4'
        ];
    }

    async ping() {
        return 'pong';
    }

    createVideo(num) {
        // TODO: modify args
        return new Promise((resolve, rejects) => {
            const proc = spawn(this.FFMPEG_COMMAND, this.ONE_VID_ARGS);
        
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