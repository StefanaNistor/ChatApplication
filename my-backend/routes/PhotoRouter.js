const express = require('express');
const photoRouter = express.Router();

const multer = require('multer');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // limit file size to 5MB
  },
});


const { Storage } = require("@google-cloud/storage");

const storage = new Storage({

  projectId: "projectchatapp-418312",
  keyFilename: "../my-backend/service-account.json",

});

photoRouter.get('/getPhoto/:id', async (req, res) => {
  const { id } = req.params;
  const { filename } = req.query; 

  try {
    const gcs = storage.bucket("gs://licenta-chatapp");
    const storagepath = `storage_folder/${filename}`;

    const file = gcs.file(storagepath);
    const exists = await file.exists();
    if (!exists[0]) {
      return res.status(404).json({ error: "File not found" });
    }

    res.setHeader('Content-Disposition', 'attachment; filename=' + filename);
    file.createReadStream().pipe(res);

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

photoRouter.post('/uploadGroupPhoto/:groupID', upload.single('file'), async (req, res) => {
  const { groupID } = req.params;
  try {
    const gcs = storage.bucket("gs://licenta-chatapp");
    const filename = groupID + 'groupPic.jpg';
    const storagepath = `storage_folder/${filename}`;

    const blob = gcs.file(storagepath);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
      },
    });

    blobStream.on('error', (err) => {
      console.log(err);
      throw new Error(err.message);
    });

    blobStream.on('finish', () => {
      const publicUrl = `https://storage.googleapis.com/${gcs.name}/${blob.name}`;
      res.status(200).send({ fileUrl: publicUrl });
    });

    blobStream.end(req.file.buffer);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.toString() });
  }
});

photoRouter.post('/uploadPhoto/:userID', upload.single('file'), async (req, res) => {
    const { userID } = req.params;
    try {
      const gcs = storage.bucket("gs://licenta-chatapp");
      const filename = userID + 'profilePic.jpg';
      const storagepath = `storage_folder/${filename}`;
  
      const blob = gcs.file(storagepath);
      const blobStream = blob.createWriteStream({
        metadata: {
          contentType: req.file.mimetype,
        },
      });
  
      blobStream.on('error', (err) => {
        console.log(err);
        throw new Error(err.message);
      });
  
      blobStream.on('finish', () => {
        const publicUrl = `https://storage.googleapis.com/${gcs.name}/${blob.name}`;
        res.status(200).send({ fileUrl: publicUrl });
      });
  
      blobStream.end(req.file.buffer);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.toString() });
    }
  });

  async function checkIfUserHasPhotos(id) {
try{
  const gcs = storage.bucket("gs://licenta-chatapp");
  const filename = id + 'profilePic.jpg';
  const storagepath = `storage_folder/${filename}`;

  const file = gcs.file(storagepath);
  const exists = await file.exists();
  return exists[0]; 
}catch(error){
  console.log(error);
  return false;

}
  }

  async function checkIfGroupHasPhotos(groupID) {
    try {
        const gcs = storage.bucket("gs://licenta-chatapp");
        const filename = groupID + 'groupPic.jpg';
        const storagepath = `storage_folder/${filename}`;
    
        const file = gcs.file(storagepath);
        const exists = await file.exists();
        return exists[0];
    } catch (error) {
        console.log(error);
        return false;
    } 
  }

  photoRouter.delete('/deleteGroupPhoto/:groupID', async (req, res) => {
    const { groupID } = req.params;
    const filename= groupID + 'groupPic.jpg';

    try {
      const gcs = storage.bucket("gs://licenta-chatapp");
      const storagepath = `storage_folder/${filename}`;
      if(checkIfGroupHasPhotos(groupID)){
      const file = gcs.file(storagepath);
      const exists = await file.exists();
      if (!exists[0]) {
        return res.status(404).json({ error: "File not found" });
      }
      else {
        await file.delete();
        res.status(200).json({ message: "File deleted successfully" });

      }
    } else {
      return res.status(200).json({ message: "Group has no photos" });
    }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  });


  photoRouter.delete('/deletePhoto/:id', async (req, res) => {
    const { id } = req.params;
    const { filename } = req.query; 
  
    try {

        const userHasPhotos = await checkIfUserHasPhotos(id);

        if (!userHasPhotos) {
            return res.status(200).json({ message: "User has no photos" });
        }

        const gcs = storage.bucket("gs://licenta-chatapp");
        const storagepath = `storage_folder/${filename}`;
  
        const file = gcs.file(storagepath);
        const exists = await file.exists();
        if (!exists[0]) {
            return res.status(404).json({ error: "File not found" });
        }
  
        await file.delete();
        res.status(200).json({ message: "File deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

photoRouter.get('/getAllProfilePhotos/:', async (req, res) => {
try {
  const profileIDs = req.params.profileIDs;
  const gcs = storage.bucket("gs://licenta-chatapp");
  const storagepath = `storage_folder/`;
  const [files] = await gcs.getFiles({ prefix: storagepath });
  const profilePicName = 'profilePic.jpg';
  const urls = files.map((file) => {
    if (file.name.includes(profilePicName) && profileIDs.includes(file.name[0])) {
      return `https://storage.googleapis.com/${gcs.name}/${file.name}`;
    }
  });
  res.status(200).json({ urls });
} catch (error) {
  console.log(error);
  res.status(500).json({ error: error.message });
}

});

//works :D
photoRouter.post('/uploadMessageAttachment/:fileName', upload.single('file'), async (req, res) => {
  const { fileName } = req.params;

  try {
    if (!req.file) {
      throw new Error('No file uploaded.');
    }

    const gcs = storage.bucket("gs://licenta-chatapp");
    const storagepath = `storage_folder/${fileName}`; 
    const blob = gcs.file(storagepath);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
      },
    });

    blobStream.on('error', (err) => {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while uploading the file.' });
    });

    blobStream.on('finish', () => {
      const publicUrl = `https://storage.googleapis.com/${gcs.name}/${blob.name}`;
      res.status(200).send({ fileUrl: publicUrl });
    });

    blobStream.end(req.file.buffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.toString() });
  }
});

// delete attached file by name 
photoRouter.delete('/deleteMessageAttachment/:fileName', async (req, res) => {
  const { fileName } = req.params;

  try {
    const gcs = storage.bucket("gs://licenta-chatapp");
    const storagepath = `storage_folder/${fileName}`;
    const file = gcs.file(storagepath);
    const exists = await file.exists();
    if (!exists[0]) {
      return res.status(404).json({ error: "File not found" });
    }

    await file.delete();
    res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});


// get fiiiiilelelele
photoRouter.get('/getMessageAttachment/:fileName', async (req, res) => {
  const { fileName } = req.params;
  try {
    const gcs = storage.bucket("gs://licenta-chatapp");
    const storagepath = `storage_folder/${fileName}`;
    const file = gcs.file(storagepath);
    const exists = await file.exists();
    if (!exists[0]) {
      return res.status(404).json({ error: "File not found" });
    }

    res.setHeader('Content-Disposition', 'attachment; filename=' + fileName);
    file.createReadStream().pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});
module.exports = photoRouter;