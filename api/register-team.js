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
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const teamData = req.body;

        if (!teamData || !teamData.teamName) {
            return res.status(400).json({ message: 'Missing team data' });
        }

        const client = await connectToDatabase();
        const db = client.db(dbName);
        const collection = db.collection("registrations");

        // Check for unique team name
        const existingTeam = await collection.findOne({ teamName: teamData.teamName });
        if (existingTeam) {
            return res.status(400).json({ message: 'Team name already exists!' });
        }

        // Add timestamps and default attendance status
        const registration = {
            ...teamData,
            createdAt: new Date().toISOString(),
            leaderPresent: false,
            // Ensure members have an isPresent field set to false
            members: (teamData.members || []).map(m => ({ ...m, isPresent: false }))
        };

        const result = await collection.insertOne(registration);

        return res.status(201).json({
            message: 'Registration successful',
            id: result.insertedId.toString()
        });
    } catch (error) {
        console.error("MongoDB Register Error:", error);
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}
