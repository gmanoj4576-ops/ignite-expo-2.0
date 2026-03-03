import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import { db, auth } from '../firebase/firebaseConfig';
import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { LogIn, QrCode, Search, CheckCircle, XCircle, LogOut, Loader2, Users } from 'lucide-react';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

const AdminScanner = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [scanResult, setScanResult] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [stats, setStats] = useState({ total: 0, attended: 0 });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
            if (user) fetchStats();
        });
        return () => unsubscribe();
    }, []);

    const fetchStats = async () => {
        const q = collection(db, 'teams');
        const snapshot = await getDocs(q);
        let total = 0;
        let attended = 0;
        snapshot.forEach(doc => {
            const data = doc.data();
            total += 1 + (data.members?.length || 0);
            if (data.attendanceMarked) attended += 1;
            // Note: In a real app, you'd track individual member attendance
        });
        setStats({ total, attended });
    };

    const handleScan = async (decodedText) => {
        if (isProcessing) return;
        setIsProcessing(true);
        setScanResult(null);

        try {
            // Assuming QR contains the registration ID
            const teamRef = doc(db, 'teams', decodedText);
            await updateDoc(teamRef, {
                attendanceMarked: true,
                attendedAt: serverTimestamp()
            });

            setScanResult({ success: true, message: "Attendance Marked Successfully!" });
            fetchStats();
        } catch (error) {
            setScanResult({ success: false, message: "Invalid or Duplicate QR Code" });
        } finally {
            setIsProcessing(false);
        }
    };

    useEffect(() => {
        if (user && !loading) {
            const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
            scanner.render(handleScan, (error) => { });
            return () => scanner.clear();
        }
    }, [user, loading]);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-black text-white"><Loader2 className="animate-spin text-neon-blue" size={40} /></div>;

    if (!user) return <AdminLogin />;

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold neon-glow">ADMIN PORTAL</h1>
                        <p className="text-gray-400 font-mono text-sm">IGNITE 2.0 Attendance System</p>
                    </div>
                    <button onClick={() => signOut(auth)} className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors">
                        <LogOut size={20} /> Logout
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard icon={<Users className="text-neon-blue" />} title="Total Registered" value={stats.total} />
                    <StatCard icon={<CheckCircle className="text-green-500" />} title="Present" value={stats.attended} />
                    <StatCard icon={<QrCode className="text-neon-purple" />} title="Pending" value={stats.total - stats.attended} />
                </div>

                <div className="glass-card p-8 border-neon-blue/20">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <QrCode className="text-neon-blue" />
                        Scan QR Code
                    </h2>
                    <div id="reader" className="overflow-hidden rounded-xl border border-white/10 bg-black/40"></div>

                    <AnimatePresence>
                        {scanResult && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className={`mt-6 p-4 rounded-xl flex items-center gap-3 ${scanResult.success ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}
                            >
                                {scanResult.success ? <CheckCircle size={24} /> : <XCircle size={24} />}
                                <span className="font-bold">{scanResult.message}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err) {
            setError("Invalid Credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-black">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-12 max-w-md w-full border-neon-blue/30">
                <div className="flex justify-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-neon-blue/10 flex items-center justify-center">
                        <LogIn className="text-neon-blue" size={32} />
                    </div>
                </div>
                <h2 className="text-3xl font-bold text-center mb-2">Admin Login</h2>
                <p className="text-gray-400 text-center mb-8">Secure access to Ignite 2.0 Backend</p>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-mono text-gray-400 uppercase tracking-widest">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 focus:border-neon-blue rounded-xl py-4 px-4 outline-none transition-all"
                            placeholder="admin@ignite.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-mono text-gray-400 uppercase tracking-widest">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 focus:border-neon-blue rounded-xl py-4 px-4 outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <button disabled={loading} className="btn-primary w-full py-4 flex items-center justify-center gap-2">
                        {loading ? <Loader2 className="animate-spin" /> : 'AUTHENTICATE'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

const StatCard = ({ icon, title, value }) => (
    <div className="glass-card p-6 border-white/5">
        <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-white/5">{icon}</div>
            <div>
                <p className="text-gray-500 text-xs font-mono uppercase tracking-wider">{title}</p>
                <p className="text-2xl font-bold">{value}</p>
            </div>
        </div>
    </div>
);

export default AdminScanner;
