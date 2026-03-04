import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import * as XLSX from 'xlsx';
import { motion } from 'framer-motion';
import { FileDown, Lock, Users, Loader2, ArrowLeft } from 'lucide-react';

const AdminDashboard = ({ onBack }) => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const ADMIN_PASSWORD = 'igniteadmin2024'; // You can change this password

    useEffect(() => {
        if (isAuthenticated) {
            fetchTeams();
        }
    }, [isAuthenticated]);

    const fetchTeams = async () => {
        setLoading(true);
        try {
            const teamsRef = collection(db, 'teams');
            const q = query(teamsRef, orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const teamsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setTeams(teamsData);
        } catch (err) {
            console.error("Error fetching teams:", err);
            setError("Failed to fetch teams.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
            setError('');
        } else {
            setError('Incorrect password!');
        }
    };

    const exportToExcel = () => {
        if (teams.length === 0) return;

        // Flatten data for Excel
        const dataToExport = teams.flatMap(team => {
            const members = team.members || [];
            // Create a row for the leader
            const leaderRow = {
                'Team Name': team.teamName,
                'Role': 'Leader',
                'Name': team.leaderName,
                'Email': team.leaderEmail,
                'Phone': team.leaderPhone,
                'College': team.leaderCollege,
                'Reg No': team.leaderRegNo,
                'Registration Date': team.createdAt?.toDate().toLocaleString() || 'N/A'
            };

            // Create rows for members
            const memberRows = members.map(m => ({
                'Team Name': team.teamName,
                'Role': 'Member',
                'Name': m.name,
                'Email': m.email,
                'Phone': 'N/A',
                'College': m.college,
                'Reg No': m.regNo,
                'Registration Date': team.createdAt?.toDate().toLocaleString() || 'N/A'
            }));

            return [leaderRow, ...memberRows];
        });

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations");

        // Set column widths
        const wscols = [
            { wch: 20 }, // Team Name
            { wch: 10 }, // Role
            { wch: 25 }, // Name
            { wch: 30 }, // Email
            { wch: 15 }, // Phone
            { wch: 30 }, // College
            { wch: 15 }, // Reg No
            { wch: 20 }  // Registration Date
        ];
        worksheet['!cols'] = wscols;

        XLSX.writeFile(workbook, `IGNITE_Registrations_${new Date().toLocaleDateString()}.xlsx`);
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card p-8 max-w-sm w-full border-neon-blue/30"
                >
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-neon-blue/10 rounded-full">
                            <Lock className="text-neon-blue" size={32} />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-center mb-6">Admin Access</h2>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="password"
                            placeholder="Enter Admin Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-neon-blue/50 transition-all text-center"
                        />
                        {error && <p className="text-red-500 text-xs text-center">{error}</p>}
                        <button type="submit" className="btn-primary w-full py-3">
                            LOGIN
                        </button>
                    </form>
                    <button onClick={onBack} className="mt-4 w-full text-gray-500 text-sm hover:text-white transition-all flex items-center justify-center gap-2">
                        <ArrowLeft size={14} /> Back to Website
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                            <Users className="text-neon-blue" /> Registration Data
                        </h1>
                        <p className="text-gray-500 mt-2 font-mono uppercase text-xs tracking-widest">
                            IEEE IGNITE 2.0 Management Console
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={exportToExcel}
                            disabled={loading || teams.length === 0}
                            className="btn-primary py-3 px-6 flex items-center gap-2 disabled:opacity-50"
                        >
                            <FileDown size={20} /> EXPORT TO EXCEL
                        </button>
                        <button onClick={onBack} className="bg-white/5 border border-white/10 py-3 px-6 rounded-xl hover:bg-white/10 transition-all">
                            EXIT
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="animate-spin text-neon-blue" size={40} />
                        <p className="text-gray-500 font-mono">RETRIEVING DATABASE RECORDS...</p>
                    </div>
                ) : (
                    <div className="glass-card overflow-hidden border-white/5">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/5 text-xs font-mono uppercase text-neon-blue border-b border-white/5">
                                        <th className="p-4">Team Name</th>
                                        <th className="p-4">Leader Name</th>
                                        <th className="p-4">Reg No</th>
                                        <th className="p-4">Members</th>
                                        <th className="p-4">Created At</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {teams.map((team) => (
                                        <tr key={team.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                                            <td className="p-4 font-bold">{team.teamName}</td>
                                            <td className="p-4">{team.leaderName}</td>
                                            <td className="p-4 font-mono text-xs">{team.leaderRegNo}</td>
                                            <td className="p-4">{(team.members?.length || 0) + 1}</td>
                                            <td className="p-4 text-gray-500 text-xs">
                                                {team.createdAt?.toDate().toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                    {teams.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="p-20 text-center text-gray-600 italic">
                                                No registrations found in the database.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
