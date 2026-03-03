const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { MongoClient } = require("mongodb");

admin.initializeApp();

// MONGODB CONNECTION STRING - Encoded password for safety
const MONGO_URI = "mongodb+srv://99240040068_db_user:Mkaunmoajr%402906@cluster0.tnn8iz1.mongodb.net/IgniteExpo?retryWrites=true&w=majority&appName=Cluster0";
const DB_NAME = "IgniteExpo";


/**
 * Triggered when a new team registers in Firestore.
 * This function copies the data to MongoDB for permanent backup.
 */
exports.syncToMongoDB = functions.firestore
    .document("teams/{teamId}")
    .onCreate(async (snap, context) => {
        const teamData = snap.data();
        const teamId = context.params.teamId;

        console.log(`Syncing team ${teamId} to MongoDB...`);

        let client;
        try {
            client = new MongoClient(MONGO_URI);
            await client.connect();

            const db = client.db(DB_NAME);
            const collection = db.collection("registrations");

            // Add timestamps for MongoDB
            const backupData = {
                ...teamData,
                firebaseId: teamId,
                syncedAt: new Date(),
            };

            const result = await collection.insertOne(backupData);
            console.log(`Successfully synced to MongoDB. InsertId: ${result.insertedId}`);

            return { success: true };
        } catch (error) {
            console.error("MongoDB Sync Error:", error);
            // In a production environment, you might want to log this to an error reporting service
            throw new functions.https.HttpsError("internal", "Failed to sync data to MongoDB");
        } finally {
            if (client) {
                await client.close();
            }
        }
    });
