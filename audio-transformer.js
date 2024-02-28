const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');

// Set the path to the FFmpeg binary
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

async function convertOpusToWav(inputFilePath, outputFilePath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputFilePath)
      .output(outputFilePath)
      .toFormat('wav')
      .on('error', (err) => {
        console.log('An error occurred: ' + err.message);
        reject(err)
      })
      .on('end', () => {
        console.error('Processing finished successfully');
        resolve()
      })
      .run();
  })
}

module.exports = convertOpusToWav