const fs = require('fs');
const AWS = require('aws-sdk');
const path = require('path');

// Configure AWS SDK with your credentials and region
AWS.config.update({
    accessKeyId: 'AKIATBRPQPUKSJG6EJPP',
    secretAccessKey: 'feEBceb/4HxXtg9Nu34rr9hxQ6FdppSI/ro6k/lO',
    region: 'us-east-1'
});

// Create a Polly client
const Polly = new AWS.Polly({
    signatureVersion: 'v4',
    region: 'us-east-1'
});

// Create an S3 client
const S3Client = new AWS.S3()

const generateSpeech = (text) => {
    return new Promise((resolve, reject) => {
        const params = {
            Text: text,
            OutputFormat: 'mp3',
            VoiceId: 'Kimberly'
        };
        Polly.synthesizeSpeech(params, (err, data) => {
            if (err) {
                reject(err);
            } else if (data && data.AudioStream instanceof Buffer) {
                const filePath = path.join(__dirname, 'speech.mp3');
                fs.writeFile(filePath, data.AudioStream, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        console.log("here1")
                        // Upload the file to S3
                        const uploadParams = {
                            Bucket: 'cpen320',
                            Key: 'speech.mp3',
                            Body: fs.createReadStream(filePath),
                            ContentType: 'audio/mpeg'
                        };
                        S3Client.upload(uploadParams, (s3Err, s3Data) => {
                            if (s3Err) {
                                console.log("error uploading to s3", s3Err);    
                                reject(s3Err);
                            } else {
                                console.log(`File uploaded successfully at ${s3Data.Location}`);
    
                                resolve(s3Data.Location); // Return the URL of the uploaded file
                            }
                        });
                    }
                });
            }
        });
    });
};

module.exports = { generateSpeech };


//module.exports = { generateSpeech };


// const { PollyClient, StartSpeechSynthesisTaskCommand } = require("@aws-sdk/client-polly");
// const AWS = require('aws-sdk');

// // Create a Polly client
// const pollyClient = new PollyClient({
//     region: "us-east-1",
//     credentials: {
//       accessKeyId: "AKIATBRPQPUKSJG6EJPP",
//       secretAccessKey: "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",
//     },
//   });

// const generateSpeech = async (text) => {
//   const params = {
//     OutputFormat: "mp3",
//     OutputS3BucketName: "cpen320",
//     Text: text,
//     TextType: "text",
//     VoiceId: "Kimberly",
//     SampleRate: "22050",
//   };

//   try {
//     const data = await pollyClient.send(new StartSpeechSynthesisTaskCommand(params));
//     console.log(`Success, audio file added to ${params.OutputS3BucketName}`);
//     console.log(data.SynthesisTask.OutputUri);
//     return data.SynthesisTask.OutputUri; // Return the URL of the uploaded file
//   } catch (err) {
//     console.log("Error putting object", err);
//     throw err;
//   }
// };
