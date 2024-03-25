const express = require('express');
const photoRouter = express.Router();

const { Storage } = require("@google-cloud/storage");

const storage = new Storage({

  projectId: "projectchatapp-418312",
  keyFilename: "service-account.json",

});

photoRouter.get('/getPhoto', async (req, res) => {
    const { filename } = req.body;
    try {
        const gcs = storage.bucket("gs://licenta-chatapp");
        const storagepath = `storage_folder/${filename}`;

        const file = gcs.file(storagepath);
        const [url] = await file.getSignedUrl({
            action: "read",
            expires: Date.now() + 1000 * 60 * 60,
        });

        return url;

    } catch (error) {
        console.log(error);
        throw new Error(error.message);

    }
});

photoRouter.post('/uploadPhoto', async (req, res) => {
    const { filepath, filename } = req.body;
    try {

        const gcs = storage.bucket("gs://licenta-chatapp");
        const storagepath = `storage_folder/${filename}`;

        const result = await gcs.upload(filepath, {
            destination: storagepath,
            public: true,
            metadata: {
                contentType: "application/plain",
            }
        });
        return result[0].metadata.mediaLink;

    } catch (error) {

        console.log(error);
        throw new Error(error.message);

    }
    
});

module.exports = photoRouter;