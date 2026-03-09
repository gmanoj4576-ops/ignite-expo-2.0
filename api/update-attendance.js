import { MongoClient } from 'mongodb';

// MongoDB connection URI from environment variables
const uri = process.env.MONGODB_URI || "mongodb+srv://99240040068_db_user:Mkaunmoajr%402906@cluster0.tnn8iz1.mongodb.net/IgniteExpo?retryWrites=true&w=majority&appName=Cluster0";
const dbName = "IgniteExpo";

let cachedClient = null;

async function connectToDatabase() {
    if (cachedClient) {
        return cachedClient;
    }
    // Added 5-second timeout to prevent indefinite hanging on Vercel
    const client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
    });
    await client.connect();
    cachedClient = client;
    return client;
}

export default async function handler(req, res) {
    // Only allow POST requests for updates
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { teamId, isLeader, memberIndex, status } = req.body;

        if (!teamId) {
            return res.status(400).json({ message: 'Missing teamId' });
        }

        const client = await connectToDatabase();
        const db = client.db(dbName);
        const collection = db.collection("registrations");

        let updateQuery = {};

        if (isLeader) {
            updateQuery = { $set: { leaderPresent: status } };
        } else {
            // Update specific member index using dot notation
            if (memberIndex === undefined || memberIndex === null) {
                return res.status(400).json({ message: 'Missing memberIndex for non-leader' });
            }
            updateQuery = { $set: { [`members.${memberIndex}.isPresent`]: status } };
        }

        // We use firebaseId to match the team since the frontend still references it, 
        // falling back to _id if we strictly use mongo _ids in the frontend.
        // The get-teams hook maps id -> firebaseId if available.
        const result = await collection.updateOne(
            { $or: [{ firebaseId: teamId }, { _id: teamId }] },
            updateQuery
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Team not found in MongoDB' });
        }

        return res.status(200).json({ message: 'Attendance updated successfully', result });
    } catch (error) {
        console.error("MongoDB Update Error:", error);
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}
