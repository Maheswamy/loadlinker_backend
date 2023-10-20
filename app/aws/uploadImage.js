const aws = require("aws-sdk");


//configuaring the aws 
aws.config.update({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: process.env.S3_BUCKET_REGION,
});

//creating a instance of S3 bucket
const s3 = new aws.S3();

const uploadFileToS3 = async (file,folder,userId) => {
  const params = {
    Bucket: "loadlinker",
    Key: `${folder}/${userId}${Date.now()}`,
    Body: file.buffer,
    ACL: "public-read",
  };

  try {
    const uploadedFile = await s3.upload(params).promise();
    return uploadedFile;
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw error; // Rethrow the error to handle it in the calling function
  }
};

module.exports = uploadFileToS3;
