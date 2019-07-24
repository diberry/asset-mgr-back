const path =require("path");
const config = require("../src/config.js");
const files = require("../src/files.js");
const strings = require("../src/strings.js");
const tts = require("../src/tts.js");
const uuid = require('uuid/v4');

describe('tts', () => {

    it('should return textToSpeech', async (done) => {

        try {
            jest.setTimeout(25000);

            const testConfig = config.getConfigTest();
            const fileFullPath = path.join(testConfig.rootDir,"./data/short.txt");

            const text = await files.readFile(fileFullPath, "utf-8");

            const options = {
                text: text,
                ttsService: testConfig.ttsService,
                id: uuid(),
                fileExtension: '.mp3',
                path:testConfig.download.dir

            };

            const answer = await tts.mp3(options);

            expect(answer).not.toEqual(undefined);
            expect(answer.result.success).toEqual(true);
            done();

        } catch(err){
            done(err);
        }

    });
    it('should return many textToSpeech', async (done) => {

        try {
            jest.setTimeout(250000);

            const testConfig = config.getConfigTest();
            const fileFullPath = path.join(testConfig.rootDir,"./data/short.txt");

            const text = await files.readFile(fileFullPath, "utf-8");

            const options = {
                text: text,
                ttsService: testConfig.ttsService,
                id: uuid(),
                fileExtension: '.mp3',
                path:testConfig.download.dir

            };

            const answer = await tts.mp3(options);

            expect(answer).not.toEqual(undefined);
            expect(answer.result.success).toEqual(true);
            done();

        } catch(err){
            done(err);
        }

    });
    it('should return local file path and name of newly created audio file', async (done) => {

        try {
            jest.setTimeout(250000);

            const testConfig = config.getConfigTest();
            const fileFullPath = path.join(testConfig.rootDir,"./data/short.txt");
            const directory = path.join(testConfig.rootDir, testConfig.upload.processingDir);

            const text = await files.readFile(fileFullPath, "utf-8");
            const culture = "en";
            const timestamp = strings.dateAsTimestamp();
            const audioFileNameWithoutExtension = `jest-test-${timestamp}-${culture}`;

            // not passing file extension or text array on purpose
            const localPathAndFileOfNewAudio = await tts.sendTextToSpeechFile(testConfig.ttsService, text, undefined, directory, audioFileNameWithoutExtension);

            expect(localPathAndFileOfNewAudio).not.toEqual(`${directory}\${localPathAndFileOfNewAudio}.mp3`);
            done();

        } catch(err){
            done(err);
        }

    });
  });