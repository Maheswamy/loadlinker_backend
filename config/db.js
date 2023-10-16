const mongoose = require("mongoose");

const dbConfig = async () => {
  const url = process.env.DB_URL || "mongodb://127.0.0.1:27017";
  const name = process.env.DB_NAME || "loadlinker";
  try {
    const db = await mongoose.connect(`${url}/${name}`);
    console.log(`server connected to db cluster name is ${db.connection.name}`);
  } catch (e) {
    console.log(e);
  }
};

module.exports=dbConfig