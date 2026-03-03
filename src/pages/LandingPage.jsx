import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, Users, Zap, Terminal, ChevronDown } from 'lucide-react';

const LandingPage = ({ onRegisterClick }) => {
    const [typedText, setTypedText] = useState('');
    const fullText = "EUPHORIA – A Techno Management Meet";

    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            setTypedText(fullText.slice(0, i));
            i++;
            if (i > fullText.length) clearInterval(interval);
        }, 100);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative min-h-screen overflow-hidden bg-black text-white">
            {/* Floating Particles Background - Reduced for Mobile Performance */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(12)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-neon-blue rounded-full opacity-20"
                        initial={{
                            x: Math.random() * 100 + "%",
                            y: Math.random() * 100 + "%"
                        }}
                        animate={{
                            y: [null, "-20%"],
                            opacity: [0.1, 0.4, 0],
                        }}
                        transition={{
                            duration: Math.random() * 5 + 10,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    />
                ))}
            </div>

            {/* Hero Section */}
            <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center pt-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="z-10 w-full"
                >
                    <motion.h2
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-neon-blue font-mono mb-4 tracking-[0.2em] uppercase text-[10px] md:text-sm max-w-[280px] md:max-w-none mx-auto leading-relaxed"
                    >
                        IEEE Robotics & Automation Society & Open-Source Society
                    </motion.h2>

                    <motion.h1
                        className="text-4xl sm:text-6xl md:text-8xl font-black mb-6 neon-glow tracking-tighter italic leading-none"
                        animate={{
                            textShadow: ["0 0 10px #00f3ff", "0 0 25px #00f3ff", "0 0 10px #00f3ff"]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                    >
                        IGNITE 2.0
                    </motion.h1>

                    <div className="h-10 md:h-12 mb-10 md:mb-16">
                        <p className="text-sm sm:text-lg md:text-2xl font-light text-gray-400 font-mono italic max-w-sm mx-auto md:max-w-none">
                            {typedText}<span className="inline-block w-2 h-4 md:w-3 md:h-6 bg-neon-blue ml-1 animate-pulse" />
                        </p>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05, boxShadow: "0 0 30px #00f3ff" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onRegisterClick}
                        className="group relative px-8 md:px-12 py-4 md:py-5 bg-neon-blue text-black font-black text-base md:text-lg rounded-full overflow-hidden transition-all shadow-lg"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-3">
                            REGISTER TEAM <Zap size={20} className="fill-current animate-pulse" />
                        </span>
                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
                    </motion.button>
                </motion.div>

                {/* Improved Scroll Indicator */}
                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 text-gray-600 flex flex-col items-center gap-1"
                >
                    <span className="text-[10px] uppercase font-mono tracking-widest mb-1">Explore</span>
                    <ChevronDown size={20} className="text-neon-blue/50" />
                </motion.div>
            </section>

            {/* Details Section */}
            <section className="relative py-20 md:py-32 px-6 max-w-6xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                    <InfoCard icon={<Calendar className="text-neon-blue" />} title="Date" value="14 March 2026" />
                    <InfoCard icon={<Clock className="text-neon-blue" />} title="Time" value="9:00 AM – 5:00 PM" />
                    <InfoCard icon={<MapPin className="text-neon-blue" />} title="Venue" value="8th Block – Seminar Hall" />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-12 md:mt-24 p-6 md:p-10 glass-card border-neon-blue/10 relative overflow-hidden group"
                >
                    <div className="absolute -top-10 -right-10 p-4 opacity-5 pointer-events-none">
                        <Terminal size={200} />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold mb-8 flex items-center gap-3">
                        <Users className="text-neon-blue" />
                        EXPO GUIDELINES
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        {[
                            "Teams: up to 6 members total.",
                            "Live technical demonstrations only.",
                            "National level certificate included.",
                            "Networking lunch provided."
                        ].map((text, i) => (
                            <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                <div className="w-1.5 h-1.5 rounded-full bg-neon-blue mt-2 shadow-[0_0_8px_#00f3ff]" />
                                <p className="text-sm md:text-base text-gray-400 font-mono tracking-tight">{text}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </section>

            {/* Footer Branding */}
            <footer className="py-12 px-6 text-center border-t border-white/5 opacity-40">
                <p className="text-[10px] md:text-xs font-mono tracking-[0.4em] uppercase">Built for IEEE Ignite © 2026</p>
            </footer>
        </div>
    );
};

const InfoCard = ({ icon, title, value }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-card p-6 md:p-8 flex items-start gap-4 border-white/5 hover:border-neon-blue/20 transition-all group"
    >
        <div className="p-3 rounded-2xl bg-white/5 group-hover:bg-neon-blue/10 transition-colors">
            {React.cloneElement(icon, { size: 20, className: "text-neon-blue group-hover:scale-110 transition-transform" })}
        </div>
        <div className="text-left">
            <p className="text-gray-500 text-[10px] font-mono uppercase tracking-[0.2em] mb-1">{title}</p>
            <h4 className="text-sm md:text-lg font-bold group-hover:text-neon-blue transition-colors">{value}</h4>
        </div>
    </motion.div>
);

export default LandingPage;
