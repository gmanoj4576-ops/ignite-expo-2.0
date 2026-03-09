import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'framer-motion';
import { FileDown, Lock, Users, Loader2, ArrowLeft, QrCode, Search, CheckCircle, XCircle, Camera, RefreshCcw } from 'lucide-react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';

const AdminDashboard = ({ onBack }) => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('teams'); // 'teams', 'scanner', 'manual'
    const [scanInput, setScanInput] = useState('');
    const [manualSearchQuery, setManualSearchQuery] = useState('');
    const [toast, setToast] = useState(null);
    const videoRef = useRef(null);
    const codeReaderRef = useRef(null);

    const ADMIN_PASSWORD = 'igniteadmin2024'; // You can change this password

    useEffect(() => {
        if (isAuthenticated) {
            fetchTeams();
        }
    }, [isAuthenticated]);

    // Handle ZXing Scanner
    useEffect(() => {
        let isComponentMounted = true;

        if (activeTab === 'scanner' && videoRef.current) {
            if (!codeReaderRef.current) {
                codeReaderRef.current = new BrowserMultiFormatReader();
            }

            // Start decoding from video device
            codeReaderRef.current.decodeFromVideoDevice(null, videoRef.current, (result, err) => {
                if (result && isComponentMounted) {
                    const scannedText = result.getText();
                    handleScanSuccess(scannedText);
                }
                if (err && !(err instanceof NotFoundException)) {
                    console.error("Scanner Error:", err);
                }
            }).catch(err => {
                console.error("Camera Init Error:", err);
                if (isComponentMounted) {
                    showToast("Failed to access camera. Please check permissions.", "error");
                }
            });
        } else {
            // Stop scanning and reset reader when not on scanner tab
            if (codeReaderRef.current) {
                codeReaderRef.current.reset();
            }
        }

        return () => {
            isComponentMounted = false;
            if (codeReaderRef.current) {
                codeReaderRef.current.reset();
            }
        };
    }, [activeTab]);

    const fetchTeams = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/get-teams');
            if (!response.ok) {
                throw new Error('Failed to fetch teams from server');
            }
            const data = await response.json();

            // Format dates correctly from MongoDB ISO strings to simulate Firestore Timestamp interface for existing UI
            const formattedTeams = data.teams.map(team => ({
                ...team,
                createdAt: team.createdAt ? { toDate: () => new Date(team.createdAt) } : null,
                syncedAt: team.syncedAt ? { toDate: () => new Date(team.syncedAt) } : null
            }));

            setTeams(formattedTeams);
        } catch (err) {
            console.error("Error fetching teams from MongoDB:", err);
            setError("Failed to fetch teams.");
        } finally {
            setLoading(false);
        }
    };

    const students = useMemo(() => {
        return teams.flatMap(team => {
            const leader = {
                id: `${team.id}-leader`,
                teamId: team.id,
                teamName: team.teamName,
                name: team.leaderName,
                regNo: team.leaderRegNo,
                type: 'Leader',
                isPresent: team.leaderPresent || false,
                isLeader: true
            };
            const members = (team.members || []).map((m, index) => ({
                id: `${team.id}-member-${index}`,
                teamId: team.id,
                teamName: team.teamName,
                name: m.name,
                regNo: m.regNo,
                type: 'Member',
                isPresent: m.isPresent || false,
                isLeader: false,
                memberIndex: index
            }));
            return [leader, ...members];
        });
    }, [teams]);

    const filteredStudents = useMemo(() => {
        if (!manualSearchQuery.trim()) return students;
        const query = manualSearchQuery.toLowerCase().trim();
        return students.filter(s =>
            (s.name && s.name.toLowerCase().includes(query)) ||
            (s.regNo && String(s.regNo).toLowerCase().includes(query)) ||
            (s.teamName && s.teamName.toLowerCase().includes(query))
        );
    }, [students, manualSearchQuery]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        // Quicker dismiss for scanner tab to not block workflow
        setTimeout(() => setToast(null), 2000);
    };

    const updateAttendance = async (student, status) => {
        // status: true for check-in, false for undo
        try {
            // Optimistic Update
            if (student.isLeader) {
                setTeams(prev => prev.map(t =>
                    t.id === student.teamId ? { ...t, leaderPresent: status } : t
                ));
            } else {
                setTeams(prev => prev.map(t => {
                    if (t.id === student.teamId) {
                        const updatedMembers = [...(t.members || [])];
                        if (updatedMembers[student.memberIndex]) {
                            updatedMembers[student.memberIndex] = { ...updatedMembers[student.memberIndex], isPresent: status };
                        }
                        return { ...t, members: updatedMembers };
                    }
                    return t;
                }));
            }

            const response = await fetch('/api/update-attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    teamId: student.teamId,
                    isLeader: student.isLeader,
                    memberIndex: student.memberIndex,
                    status: status
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update attendance on server');
            }

            showToast(status ? `${student.name} marked as PRESENT!` : `${student.name} attendance REMOVED.`, status ? "success" : "error");

            if (status && activeTab === 'scanner') {
                const audio = new Audio('data:audio/mp3;base64,//tQxAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//tQxAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq');
                audio.play().catch(e => console.log('Audio play prevented', e));
            }
        } catch (err) {
            console.error("Error updating attendance:", err);
            showToast("Failed to update attendance.", "error");
            // Re-fetch to sync state on failure
            fetchTeams();
        }
    };

    const handleScanSuccess = (scannedRegNo) => {
        if (!scannedRegNo) return;
        const normalizedRef = scannedRegNo.trim().toUpperCase();

        const student = students.find(s => s.regNo && String(s.regNo).toUpperCase() === normalizedRef);

        if (student) {
            if (student.isPresent) {
                showToast(`${student.name} is already checked in.`, "error");
            } else {
                updateAttendance(student, true);
            }
        } else {
            showToast(`No student found with Register Number: ${normalizedRef}`, "error");
        }
    };

    const handleManualScanSubmit = (e) => {
        e.preventDefault();
        handleScanSuccess(scanInput);
        setScanInput('');
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
                'Team ID': team.id,
                'Team Name': team.teamName,
                'Role': 'Leader',
                'Name': team.leaderName,
                'Email': team.leaderEmail,
                'Phone': team.leaderPhone,
                'College': team.leaderCollege,
                'Department': team.leaderDepartment || 'N/A',
                'Reg No': team.leaderRegNo,
                'Attendance': team.leaderPresent ? 'YES' : 'NO',
                'Registration Date': team.createdAt?.toDate().toLocaleString() || 'N/A'
            };

            // Create rows for members
            const memberRows = members.map(m => ({
                'Team ID': team.id,
                'Team Name': team.teamName,
                'Role': 'Member',
                'Name': m.name,
                'Email': m.email,
                'Phone': 'N/A',
                'College': m.college,
                'Department': m.department || 'N/A',
                'Reg No': m.regNo,
                'Attendance': m.isPresent ? 'YES' : 'NO',
                'Registration Date': team.createdAt?.toDate().toLocaleString() || 'N/A'
            }));

            return [leaderRow, ...memberRows];
        });

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations");

        // Set column widths
        const wscols = [
            { wch: 25 }, // Team ID
            { wch: 20 }, // Team Name
            { wch: 10 }, // Role
            { wch: 25 }, // Name
            { wch: 30 }, // Email
            { wch: 15 }, // Phone
            { wch: 30 }, // College
            { wch: 25 }, // Department
            { wch: 15 }, // Reg No
            { wch: 15 }, // Attendance
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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                            <Users className="text-neon-blue" /> Management Console
                        </h1>
                        <p className="text-gray-500 mt-2 font-mono uppercase text-xs tracking-widest">
                            IEEE IGNITE 2.0 Registration & Attendance
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

                <div className="flex gap-4 mb-8 border-b border-white/10 pb-4">
                    <button
                        onClick={() => setActiveTab('teams')}
                        className={`font-mono uppercase text-sm font-bold pb-2 px-4 transition-all ${activeTab === 'teams' ? 'text-neon-blue border-b-2 border-neon-blue' : 'text-gray-500 hover:text-white'}`}
                    >
                        Teams Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('scanner')}
                        className={`font-mono uppercase text-sm font-bold pb-2 px-4 transition-all flex items-center gap-2 ${activeTab === 'scanner' ? 'text-neon-blue border-b-2 border-neon-blue' : 'text-gray-500 hover:text-white'}`}
                    >
                        <Camera size={16} /> Live Scanner
                    </button>
                    <button
                        onClick={() => setActiveTab('manual')}
                        className={`font-mono uppercase text-sm font-bold pb-2 px-4 transition-all flex items-center gap-2 ${activeTab === 'manual' ? 'text-neon-blue border-b-2 border-neon-blue' : 'text-gray-500 hover:text-white'}`}
                    >
                        <Users size={16} /> Manual List
                    </button>
                </div>

                <AnimatePresence>
                    {toast && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`fixed top-4 right-4 z-50 p-4 rounded-xl border flex items-center gap-3 shadow-xl ${toast.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
                                }`}
                        >
                            {toast.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                            <p className="font-bold">{toast.message}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="animate-spin text-neon-blue" size={40} />
                        <p className="text-gray-500 font-mono">RETRIEVING DATABASE RECORDS...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                        <XCircle className="text-red-500" size={40} />
                        <p className="text-red-400 font-bold">{error}</p>
                        <p className="text-gray-500 text-sm max-w-md">This is usually caused by MongoDB IP Whitelisting or SSL issues on the server.</p>
                        <button onClick={fetchTeams} className="mt-4 btn-primary py-2 px-6 flex items-center gap-2">
                            <RefreshCcw size={16} /> RETRY CONNECTION
                        </button>
                    </div>
                ) : activeTab === 'teams' ? (
                    <div className="glass-card overflow-hidden border-white/5">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/5 text-xs font-mono uppercase text-neon-blue border-b border-white/5">
                                        <th className="p-4">Team Name</th>
                                        <th className="p-4">Leader Name</th>
                                        <th className="p-4">Reg No</th>
                                        <th className="p-4">Dept</th>
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
                                            <td className="p-4 text-xs">{team.leaderDepartment || '-'}</td>
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
                ) : activeTab === 'scanner' ? (
                    <div className="flex flex-col items-center max-w-2xl mx-auto space-y-6">
                        <div className="glass-card w-full p-6 border-neon-blue/30 text-center">
                            <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
                                <QrCode className="text-neon-blue" /> Camera Scanner
                            </h2>
                            <p className="text-gray-500 text-sm mb-6">Point your camera at a participant's ID Barcode.</p>

                            <div className="relative w-full aspect-video md:aspect-square max-h-[400px] bg-black rounded-xl overflow-hidden border-2 border-dashed border-white/20 flex items-center justify-center group">
                                <video
                                    ref={videoRef}
                                    className="w-full h-full object-cover"
                                />
                                {/* Scanning UI overlay */}
                                <div className="absolute inset-x-8 inset-y-8 border-2 border-neon-blue/50 rounded-xl pointer-events-none">
                                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-neon-blue -translate-x-1 -translate-y-1"></div>
                                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-neon-blue translate-x-1 -translate-y-1"></div>
                                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-neon-blue -translate-x-1 translate-y-1"></div>
                                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-neon-blue translate-x-1 translate-y-1"></div>

                                    <motion.div
                                        animate={{ y: ["0%", "400%", "0%"] }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                        className="w-full h-0.5 bg-neon-blue/50 shadow-[0_0_10px_2px_rgba(0,195,255,0.5)]"
                                    />
                                </div>
                            </div>

                            <p className="text-neon-blue text-xs mt-4 animate-pulse flex items-center justify-center gap-2">
                                <Loader2 size={14} className="animate-spin" /> SCANNING FOR BARCODES...
                            </p>
                        </div>

                        <div className="glass-card w-full p-6 border-white/10">
                            <h3 className="text-sm font-bold text-gray-400 uppercase mb-3 text-center">Or Scan via USB / Enter Manually</h3>
                            <form onSubmit={handleManualScanSubmit} className="flex flex-col md:flex-row gap-4">
                                <div className="relative flex-1">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="text-gray-500" size={20} />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Type Register Number..."
                                        value={scanInput}
                                        onChange={(e) => setScanInput(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-neon-blue/50 transition-all font-mono uppercase"
                                    />
                                </div>
                                <button type="submit" className="bg-white/10 hover:bg-white/20 px-8 rounded-xl font-bold transition-all whitespace-nowrap">
                                    SUBMIT
                                </button>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="glass-card p-6 border-neon-blue/30 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Users className="text-neon-blue" /> Manual Attendance Mode
                                </h2>
                                <p className="text-gray-500 text-sm mt-1">Check-in students manually or undo mistakes.</p>
                            </div>
                            <div className="relative w-full md:w-64">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="text-gray-500" size={18} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search name, reg no, team..."
                                    value={manualSearchQuery}
                                    onChange={(e) => setManualSearchQuery(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 outline-none focus:border-neon-blue/50 transition-all text-sm"
                                />
                            </div>
                        </div>

                        <div className="glass-card overflow-hidden border-white/5">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white/5 text-xs font-mono uppercase text-neon-blue border-b border-white/5">
                                            <th className="p-4">Name</th>
                                            <th className="p-4">Reg No</th>
                                            <th className="p-4">Team</th>
                                            <th className="p-4">Role</th>
                                            <th className="p-4 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {filteredStudents.map((student) => (
                                            <tr key={student.id} className={`border-b border-white/5 transition-all ${student.isPresent ? 'bg-green-500/5' : 'hover:bg-white/5'}`}>
                                                <td className="p-4 font-bold">{student.name}</td>
                                                <td className="p-4 font-mono text-xs">{student.regNo || '-'}</td>
                                                <td className="p-4 text-xs">{student.teamName}</td>
                                                <td className="p-4 text-xs">
                                                    <span className={`px-2 py-1 rounded text-[10px] ${student.type === 'Leader' ? 'bg-neon-blue/20 text-neon-blue' : 'bg-white/10 text-gray-300'}`}>
                                                        {student.type}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    {student.isPresent ? (
                                                        <button
                                                            onClick={() => updateAttendance(student, false)}
                                                            className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 hover:border-red-500/50 px-3 py-1.5 rounded transition-all flex items-center gap-1 mx-auto"
                                                        >
                                                            <RefreshCcw size={12} /> UNDO
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => updateAttendance(student, true)}
                                                            className="text-xs bg-white/10 hover:bg-neon-blue/20 hover:text-neon-blue border border-white/10 hover:border-neon-blue/50 px-3 py-1.5 rounded transition-all w-full md:w-auto mx-auto"
                                                        >
                                                            CHECK IN
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {students.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="p-20 text-center text-gray-600 italic">
                                                    No participants found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
