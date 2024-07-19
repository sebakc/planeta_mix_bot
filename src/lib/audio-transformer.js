const ffmpeg = require('fluent-ffmpeg');

function execCommand(command) {
  const exec = require('child_process').exec;
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.warn(error);
      }
      if (stderr) {
        console.warn(stderr);
      }
      resolve(stdout);
    });
  });
}

function isWindows() {
  return process.platform === 'win32';
}

const ffmpegPath = isWindows() ? execCommand('where ffmpeg') : execCommand('which ffmpeg');

// Set the path to the FFmpeg binary
ffmpeg.setFfmpegPath(ffmpegPath);

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