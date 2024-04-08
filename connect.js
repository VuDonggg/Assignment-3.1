import { MongoClient } from "mongodb";
    const main = async () => {
        let conn = await MongoClient.connect("mongodb://localhost");
        let db = conn.db("cs193x_assgin3");
        let myColl = db.collection("users")
        let docs = await myColl.find({num : 200}).toArray();
    };
main();