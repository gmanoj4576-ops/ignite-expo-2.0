import { MongoClient, ObjectId } from 'mongodb';

// MongoDB connection URI from environment variables
const uri = process.env.MONGODB_URI || "mongodb+srv://99240040068_db_user:Mkaunmoajr%402906@cluster0.tnn8iz1.mongodb.net/IgniteExpo?retryWrites=true&w=majority&appName=Cluster0";
const dbName = "IgniteExpo";

// Cached connection for performance
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
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const client = await connectToDatabase();
        const db = client.db(dbName);
        const collection = db.collection("registrations");

        // Fetch all teams and sort by creation date (newest first)
        // Check for both createdAt and firebaseId as potential sort/identifer fields
        const teams = await collection.find({}).sort({ createdAt: -1, _id: -1 }).toArray();

        // Convert MongoDB _id to string id for frontend compatibility
        const formattedTeams = teams.map(team => {
            const { _id, ...rest } = team;
            // Provide a compatible 'id' field whether it's the firebaseId or the Mongo _id
            return {
                ...rest,
                id: team.firebaseId || _id.toString(),
                // Keep original _id around just in case we need it for updates
                mongoId: _id.toString()
            };
        });

        return res.status(200).json({ teams: formattedTeams });
    } catch (error) {
        console.error("MongoDB Fetch Error:", error);
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}
