import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Zap, Activity } from 'lucide-react';

const RobotLoader = () => {
    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden">
            {/* Background Pulsing Grid */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#00f3ff_1px,transparent_1px)] [background-size:40px_40px]" />

            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative"
            >
                {/* Robot Head Shape */}
                <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-32 h-32 border-2 border-neon-blue rounded-3xl flex items-center justify-center relative bg-black/50 backdrop-blur-xl shadow-neon-blue/20 shadow-2xl"
                >
                    {/* Eyes */}
                    <div className="flex gap-6">
                        <motion.div
                            animate={{
                                scaleY: [1, 1, 0.1, 1, 1],
                                backgroundColor: ["#00f3ff", "#bc13fe", "#00f3ff"]
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="w-4 h-4 bg-neon-blue rounded-full shadow-[0_0_10px_#00f3ff]"
                        />
                        <motion.div
                            animate={{
                                scaleY: [1, 1, 0.1, 1, 1],
                                backgroundColor: ["#00f3ff", "#bc13fe", "#00f3ff"]
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="w-4 h-4 bg-neon-blue rounded-full shadow-[0_0_10px_#00f3ff]"
                        />
                    </div>

                    {/* Antenna */}
                    <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="absolute -top-6 left-1/2 -translate-x-1/2 w-1 h-6 bg-neon-blue"
                    >
                        <motion.div
                            animate={{ opacity: [1, 0.5, 1] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                            className="absolute -top-2 -left-1 w-3 h-3 bg-neon-purple rounded-full shadow-[0_0_10px_#bc13fe]"
                        />
                    </motion.div>

                    {/* Scanning Line */}
                    <motion.div
                        animate={{ top: ["10%", "90%", "10%"] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-px bg-neon-blue/50 z-20"
                    />
                </motion.div>

                {/* Circular Orbitals */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute -inset-8 border border-neon-blue/10 rounded-full border-dashed"
                />
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute -inset-16 border border-neon-purple/5 rounded-full border-dashed"
                />
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-12 text-center"
            >
                <h2 className="text-2xl font-black neon-glow tracking-widest text-neon-blue italic">
                    INITIALIZING IGNITE 2.0
                </h2>
                <div className="flex items-center justify-center gap-4 mt-4 text-gray-400 font-mono text-xs uppercase tracking-[0.3em]">
                    <Activity size={14} className="text-neon-purple" />
                    <span>System Synchronization</span>
                    <Activity size={14} className="text-neon-purple" />
                </div>
            </motion.div>

            {/* Loading Progress Bar */}
            <div className="mt-8 w-64 h-1 bg-white/5 rounded-full overflow-hidden relative">
                <motion.div
                    animate={{ left: ["-100%", "100%"] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-neon-blue to-transparent"
                />
            </div>
        </div>
    );
};

export default RobotLoader;
