const aws = require("aws-sdk");
aws.config.update({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: process.env.S3_BUCKET_REGION,
});

const s3 = new aws.S3();

const uploadFileToS3 = async (file) => {
  console.log(file);

  const params = {
    Bucket: "loadlinker",
    Key: `uploads/${file.originalname}`,
    Body: file.buffer,
    ACL: "public-read",
  };

  try {
    const uploadedFile = await s3.upload(params).promise();
    console.log(uploadedFile)
    return uploadedFile;
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw error; // Rethrow the error to handle it in the calling function
  }
};


module.exports=uploadFileToS3