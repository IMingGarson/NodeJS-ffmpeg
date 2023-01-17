const spawn = require('child_process').spawn;
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
class VideoController {

    constructor() {
        this.FFMPEG_COMMAND = 'ffmpeg';
    }

    async ping() {
        return 'pong';
    }

    async createFrame(sequence, timeline) {
        const clipsComposition = [];
        const transposed = this.transpose(timeline);
        const num = sequence.length;
        const materialPath = `./assets/videos/materials/${crypto.randomUUID()}`;
        if (!fs.existsSync(materialPath)){
            fs.mkdirSync(materialPath);
        }

        let args = [];
        for (let i = 0; i < transposed.length; i++) {
            if (num == 1) {
                args = [
                    '-y',
                    '-stream_loop',
                    '2',
                    '-i',
                    `./assets/videos/${sequence[0]}/${transposed[i][0]}_700x700.mp4`,
                    '-c:v',
                    'copy',
                ]
            } else if (num == 2) {
                args = [
                    '-y',
                    '-vsync',
                    'vfr',
                    '-stream_loop',
                    '2',
                    '-i',
                    `./assets/videos/${sequence[0]}/${transposed[i][0]}_350x700.mp4`,
                    '-stream_loop',
                    '2',
                    '-i',
                    `./assets/videos/${sequence[1]}/${transposed[i][1]}_350x700.mp4`,
                    '-filter_complex',
                    'hstack=inputs=2',
                ];
            } else if (num == 3) {
                args = [
                    '-y',
                    '-vsync',
                    'vfr',
                    '-stream_loop',
                    '2',
                    '-i',
                    `./assets/videos/${sequence[1]}/${transposed[i][1]}_350x350.mp4`,
                    '-stream_loop',
                    '2',
                    '-i',
                    `./assets/videos/${sequence[2]}/${transposed[i][2]}_350x350.mp4`,
                    '-stream_loop',
                    '2',
                    '-i',
                    `./assets/videos/${sequence[0]}/${transposed[i][0]}_350x700.mp4`,
                    '-filter_complex',
                    '[0:v][1:v]vstack=inputs=2[v01];[2:v][v01]hstack=inputs=2',
                ];
            } else if (num == 4) {
                args = [
                    '-y',
                    '-vsync',
                    'vfr',
                    '-stream_loop',
                    '2',
                    '-i',
                    `./assets/videos/${sequence[0]}/${transposed[i][0]}_350x350.mp4`,
                    '-stream_loop',
                    '2',
                    '-i',
                    `./assets/videos/${sequence[1]}/${transposed[i][1]}_350x350.mp4`,
                    '-stream_loop',
                    '2',
                    '-i',
                    `./assets/videos/${sequence[2]}/${transposed[i][2]}_350x350.mp4`,
                    '-stream_loop',
                    '2',
                    '-i',
                    `./assets/videos/${sequence[3]}/${transposed[i][3]}_350x350.mp4`,
                    '-filter_complex',
                    '[0:v][1:v]vstack=inputs=2[v01];[2:v][3:v]vstack=inputs=2[v23];[v01][v23]hstack=inputs=2',
                ];
            }

            let clipName = await new Promise((resolve, rejects) => {
                const fileName = `output_${i}.mp4`;
                args.push(`${materialPath}/${fileName}`);

                const proc = spawn(this.FFMPEG_COMMAND, args);

                args.pop();
        
                proc.stderr.setEncoding("utf8")
        
                proc.stderr.on('data', function(data) {
                    console.log('[CreateFrame] PROCESS OUTPUT ON DATA', data);
                });
                
                proc.on('close', function() {
                    resolve(fileName);
                });
    
                proc.on('error', function(error) {
                    console.error('[CreateFrame] Error: ', error);
                    rejects(false);
                });
            });

            if (!clipName) {
                return false;
            }
            clipsComposition.push(clipName);
        }

        const clipTxt = `${materialPath}/clip.txt`;        
        for (let i = 0; i < clipsComposition.length; i++) {
            fs.appendFileSync(clipTxt, 'file' + " \'" + clipsComposition[i] + "\'" + "\n");
        }

        return materialPath;
    }

    async createVideo(materialPath) {
        const filename = `./assets/output/${crypto.randomUUID()}.mp4`;
        const clipTxt = `${materialPath}/clip.txt`;
        const args = [
            '-y',
            '-f',
            'concat',
            '-safe',
            '0',
            '-i',
            clipTxt,
            '-i',
            './assets/audio/bgm.mp3',
            '-c',
            'copy',
            '-map',
            '0:v:0',
            '-map',
            '1:a:0',
            '-shortest',
            filename
        ];

        const result = await new Promise((resolve, rejects) => {
            const proc = spawn(this.FFMPEG_COMMAND, args);
        
            proc.stderr.setEncoding("utf8")
    
            proc.stderr.on('data', function(data) {
                console.log('[CreateVideo] PROCESS OUTPUT ON DATA', data);
            });
            
            proc.on('close', function() {
                resolve(filename);
            });

            proc.on('error', function(error) {
                console.error('[CreateVideo] Error: ', error);
                rejects(false);
            });
        });

        this.cleanData(materialPath);
        return result;
    }

    getVideoByFileName(filename) {
        return `./assets/output/${filename}.mp4`;
    }

    transpose(matrix) {
        return matrix[0].map((_, i) => matrix.map(row => row[i]));
    }

    // Remove unused static files
    cleanData(directory) {
        try {
            fs.rmSync(directory, { recursive: true, force: true });
        } catch (e) {
            console.error('[CleanData] Unlink error', e);
        }
        return true;
    }
}

module.exports = {
    VideoController
};