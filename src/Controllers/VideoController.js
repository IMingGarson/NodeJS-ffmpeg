const spawn = require('child_process').spawn;
const fs = require('fs');
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
        let args = [];

        for (let i = 0; i < transposed.length; i++) {
            if (num == 1) {
                args = [
                    '-y',
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
                    '-i',
                    `./assets/videos/${sequence[0]}/${transposed[i][0]}_350x700.mp4`,
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
                    '-i',
                    `./assets/videos/${sequence[1]}/${transposed[i][1]}_350x350.mp4`,
                    '-i',
                    `./assets/videos/${sequence[2]}/${transposed[i][2]}_350x350.mp4`,
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
                    '-i',
                    `./assets/videos/${sequence[0]}/${transposed[i][0]}_350x350.mp4`,
                    '-i',
                    `./assets/videos/${sequence[1]}/${transposed[i][1]}_350x350.mp4`,
                    '-i',
                    `./assets/videos/${sequence[2]}/${transposed[i][2]}_350x350.mp4`,
                    '-i',
                    `./assets/videos/${sequence[3]}/${transposed[i][3]}_350x350.mp4`,
                    '-filter_complex',
                    '[0:v][1:v]vstack=inputs=2[v01];[2:v][3:v]vstack=inputs=2[v23];[v01][v23]hstack=inputs=2',
                ];
            }

            let clipName = await new Promise((resolve, rejects) => {
                const fileName = `output_${i}.mp4`;
                args.push(`./assets/videos/${fileName}`);

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

        const clipTxt = `./assets/videos/${crypto.randomUUID()}.txt`;
        for (let i = 0; i < clipsComposition.length; i++) {
            fs.appendFileSync(clipTxt, 'file' + " \'" + clipsComposition[i] + "\'" + "\n");
        }

        return clipTxt;
    }

    async createVideo(clipTxt) {
        const filename = `./assets/output/` + crypto.randomUUID() + '.mp4';
        const args = [
            '-y',
            '-f',
            'concat',
            '-safe',
            '0',
            '-i',
            clipTxt,
            '-c',
            'copy',
            filename
        ];

        return await new Promise((resolve, rejects) => {
            const proc = spawn(this.FFMPEG_COMMAND, args);
        
            proc.stderr.setEncoding("utf8")
    
            proc.stderr.on('data', function(data) {
                console.log('[CreateVideo] PROCESS OUTPUT ON DATA', data);
            });
            
            proc.on('close', function() {
                fs.unlink(clipTxt, (error) => {
                    if (error) {
                        console.error('[CreateVideo] Unlink error', error);
                    }
                });
                resolve(filename);
            });

            proc.on('error', function(error) {
                console.error('[CreateVideo] Error: ', error);
                rejects(false);
            });
        });
    }

    getVideoByFileName(filename) {
        return `./assets/output/${filename}.mp4`;
    }

    transpose(matrix) {
        return matrix[0].map((_, i) => matrix.map(row => row[i]));
    }
}

module.exports = {
    VideoController
};