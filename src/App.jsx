import React, { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import RegistrationForm from './pages/RegistrationForm';
import RobotLoader from './components/RobotLoader';
import { AnimatePresence, motion } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

function AppContent() {
    const [view, setView] = useState('landing');
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() => {
        // Artificial initialization for the robot loader
        const timer = setTimeout(() => {
            setIsInitializing(false);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    if (isInitializing) {
        return <RobotLoader />;
    }

    return (
        <div className="min-h-screen bg-black overflow-x-hidden selection:bg-neon-blue selection:text-black">
            <AnimatePresence mode="wait">
                <Routes>
                    <Route path="/" element={
                        <motion.div
                            key="landing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                        >
                            <LandingPage onRegisterClick={() => setView('register')} />
                            {view === 'register' && (
                                <div className="fixed inset-0 z-50 bg-black overflow-y-auto">
                                    <RegistrationForm onBack={() => setView('landing')} />
                                </div>
                            )}
                        </motion.div>
                    } />
                </Routes>
            </AnimatePresence>

            {/* Global Background Glows */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] md:w-[40%] h-[40%] bg-neon-blue/10 blur-[80px] md:blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] md:w-[40%] h-[40%] bg-neon-purple/5 blur-[80px] md:blur-[120px] rounded-full" />
            </div>
        </div>
    );
}

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;
