import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, useFieldArray } from 'react-hook-form';
import {
    User, Users, Mail, Phone, School, Hash, Plus, Trash2,
    ArrowLeft, ArrowRight, Loader2, CheckCircle2, AlertCircle, Sparkles
} from 'lucide-react';
import { registerTeam } from '../firebase/firebaseConfig';

const RegistrationForm = ({ onBack }) => {
    const [step, setStep] = useState(0); // 0: Team, 1: Leader, 2-6: Members, 7: Review
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState(null);

    const { register, control, handleSubmit, formState: { errors }, trigger, watch } = useForm({
        defaultValues: {
            teamName: '',
            leaderName: '',
            leaderEmail: '',
            leaderPhone: '',
            leaderCollege: '',
            leaderRegNo: '',
            members: []
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'members'
    });

    const watchData = watch();

    const nextStep = async () => {
        let fieldsToValidate = [];
        if (step === 0) fieldsToValidate = ['teamName'];
        if (step === 1) fieldsToValidate = ['leaderName', 'leaderEmail', 'leaderPhone', 'leaderCollege', 'leaderRegNo'];
        if (step >= 2 && step < 2 + fields.length) {
            const idx = step - 2;
            fieldsToValidate = [`members.${idx}.name`, `members.${idx}.email`, `members.${idx}.regNo`, `members.${idx}.college`];
        }

        const isValid = await trigger(fieldsToValidate);
        if (isValid) setStep(prev => prev + 1);
    };

    const prevStep = () => {
        if (step === 0) onBack();
        else setStep(prev => prev - 1);
    };

    const onSubmit = async (data) => {
        console.log("onSubmit: Started registration submission", data);
        setIsSubmitting(true);
        setError(null);

        try {
            console.log("onSubmit: Calling registerTeam...");
            const result = await registerTeam(data);
            console.log("onSubmit: registerTeam resolved", result);
            setIsSuccess(true);
        } catch (err) {
            console.error("onSubmit: Submission error caught:", err);
            let msg = err.message || "An error occurred";
            if (msg.includes("YOUR_PROJECT_ID") || msg.includes("invalid-app-id") || msg.includes("Firebase: Error")) {
                msg = "Firebase connection failed. Please ensure Firestore is ENABLED in your Firebase Console and your keys are correct.";
            }
            setError(msg);
        } finally {
            console.log("onSubmit: Finalizing submission state");
            setIsSubmitting(false);
        }
    };



    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-black">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="glass-card p-8 md:p-12 text-center max-w-md w-full border-neon-blue/50 mx-auto"
                >
                    <div className="flex justify-center mb-6">
                        <CheckCircle2 size={80} className="text-neon-blue animate-pulse" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">Registration Successful!</h2>
                    <p className="text-gray-400 mb-8 text-sm md:text-base">
                        Your team **{watchData.teamName}** has been registered for IEEE IGNITE 2.0. Confirmation emails have been dispatched.
                    </p>
                    <button onClick={onBack} className="btn-primary w-full py-4 text-base">
                        Back to Home
                    </button>
                </motion.div>
            </div>
        );
    }

    const steps = [
        { title: "Team Identity", icon: <Users className="text-neon-blue" /> },
        { title: "Team Leader", icon: <Sparkles className="text-neon-purple" /> },
        ...fields.map((_, i) => ({ title: `Member ${i + 1}`, icon: <User className="text-neon-blue" /> })),
        { title: "Final Review", icon: <CheckCircle2 className="text-green-500" /> }
    ];

    return (
        <div className="min-h-screen py-10 px-4 md:py-20 flex flex-col items-center">
            <div className="max-w-2xl w-full">
                {/* Progress Bar */}
                <div className="mb-10 overflow-x-auto pb-4 hide-scrollbar">
                    <div className="flex justify-between min-w-[300px] px-2">
                        {steps.map((s, i) => (
                            <div key={i} className="flex flex-col items-center gap-2 relative">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 z-10 
                  ${i === step ? 'border-neon-blue bg-neon-blue/20 shadow-neon-blue shadow-[0_0_15px]' :
                                            i < step ? 'border-neon-blue bg-neon-blue text-black' : 'border-white/10 bg-white/5 text-gray-600'}`}
                                >
                                    {i < step ? <CheckCircle2 size={20} /> : i + 1}
                                </div>
                                {i < steps.length - 1 && (
                                    <div className={`absolute left-10 top-5 w-[calc(100%-20px)] h-0.5 mt-[1px]
                  ${i < step ? 'bg-neon-blue' : 'bg-white/5'}`} />
                                )}
                                <span className={`text-[10px] md:text-xs font-mono uppercase tracking-widest whitespace-nowrap
                ${i === step ? 'text-neon-blue font-bold' : 'text-gray-600'}`}>
                                    {s.title}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {step > 0 && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mb-6 flex flex-wrap gap-3"
                        >
                            <div className="glass-card py-2 px-4 border-neon-blue/30 flex items-center gap-2 bg-neon-blue/5">
                                <Users size={14} className="text-neon-blue" />
                                <span className="text-[10px] uppercase tracking-tighter text-gray-400">Team</span>
                                <span className="text-sm font-bold text-white uppercase">{watchData.teamName}</span>
                            </div>
                            {step > 1 && (
                                <motion.div
                                    initial={{ x: -10, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    className="glass-card py-2 px-4 border-neon-purple/30 flex items-center gap-2 bg-neon-purple/5"
                                >
                                    <Sparkles size={14} className="text-neon-purple" />
                                    <span className="text-[10px] uppercase tracking-tighter text-gray-400">Leader</span>
                                    <span className="text-sm font-bold text-white uppercase">{watchData.leaderName}</span>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="glass-card p-6 md:p-10 relative overflow-hidden"
                >

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-center gap-3 text-sm">
                            <AlertCircle size={18} /> {error}
                        </div>
                    )}

                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-white/5 rounded-2xl">
                            {steps[step].icon}
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold">{steps[step].title}</h2>
                            <p className="text-gray-500 text-xs md:text-sm font-mono mt-1">
                                STEP {step + 1} OF {steps.length}
                            </p>
                        </div>
                    </div>

                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-8"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.target.tagName !== 'BUTTON') {
                                e.preventDefault();
                                if (step < 2 + fields.length) {
                                    nextStep();
                                }
                            }
                        }}
                    >
                        {step === 0 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 text-left">
                                <Input
                                    label="Team Name"
                                    {...register('teamName', { required: 'Team name is required' })}
                                    error={errors.teamName}
                                    icon={<Users size={18} />}
                                    placeholder="Enter your squad name"
                                />
                                <div className="p-4 bg-neon-blue/5 border border-neon-blue/10 rounded-xl">
                                    <p className="text-xs text-neon-blue/80 leading-relaxed uppercase tracking-wider font-mono">
                                        Note: Team name must be unique. You can add up to 5 additional members in the following steps.
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {step === 1 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                                <Input label="Leader Name" {...register('leaderName', { required: 'Required' })} error={errors.leaderName} icon={<User size={18} />} />
                                <Input label="Email Address" type="email" {...register('leaderEmail', { required: 'Required', pattern: /^\S+@\S+$/i })} error={errors.leaderEmail} icon={<Mail size={18} />} />
                                <Input label="Phone Number" {...register('leaderPhone', { required: 'Required', pattern: /^[0-9]{10}$/ })} error={errors.leaderPhone} icon={<Phone size={18} />} />
                                <Input label="Register Number" {...register('leaderRegNo', { required: 'Required' })} error={errors.leaderRegNo} icon={<Hash size={18} />} />
                                <div className="md:col-span-2">
                                    <Input label="College Name" {...register('leaderCollege', { required: 'Required' })} error={errors.leaderCollege} icon={<School size={18} />} />
                                </div>
                            </motion.div>
                        )}

                        {step >= 2 && step < 2 + fields.length && (
                            <motion.div key={step} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                                <div className="md:col-span-2 flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                                    <p className="text-sm font-bold text-neon-blue">ENTRY FOR MEMBER {step - 1}</p>
                                    <button type="button" onClick={() => { remove(step - 2); setStep(prev => prev - 1); }} className="text-red-500 hover:text-red-400 text-xs flex items-center gap-1 transition-colors">
                                        <Trash2 size={14} /> REMOVE
                                    </button>
                                </div>
                                <Input label="Member Name" {...register(`members.${step - 2}.name`, { required: 'Required' })} error={errors.members?.[step - 2]?.name} icon={<User size={18} />} />
                                <Input label="Member Email" type="email" {...register(`members.${step - 2}.email`, { required: 'Required' })} error={errors.members?.[step - 2]?.email} icon={<Mail size={18} />} />
                                <Input label="Register Number" {...register(`members.${step - 2}.regNo`, { required: 'Required' })} error={errors.members?.[step - 2]?.regNo} icon={<Hash size={18} />} />
                                <Input label="College Name" {...register(`members.${step - 2}.college`, { required: 'Required' })} error={errors.members?.[step - 2]?.college} icon={<School size={18} />} />
                            </motion.div>
                        )}

                        {step === 2 + fields.length && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                <div className="p-6 bg-white/5 rounded-2xl border border-white/5 text-left">
                                    <h4 className="text-neon-blue font-mono text-sm uppercase mb-4 tracking-widest">Team Summary</h4>
                                    <div className="space-y-2 text-sm">
                                        <p className="flex justify-between"><span className="text-gray-500">Team:</span> <span>{watchData.teamName}</span></p>
                                        <p className="flex justify-between"><span className="text-gray-500">Leader:</span> <span>{watchData.leaderName}</span></p>
                                        <p className="flex justify-between"><span className="text-gray-500">Members:</span> <span>{fields.length}</span></p>
                                    </div>
                                </div>

                                {fields.length < 5 && (
                                    <button
                                        type="button"
                                        onClick={() => { append({ name: '', email: '', regNo: '', college: '' }); setStep(fields.length + 2); }}
                                        className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-neon-blue/30 rounded-2xl text-neon-blue hover:bg-neon-blue/5 transition-all font-bold"
                                    >
                                        <Plus size={20} /> ADD ANOTHER MEMBER
                                    </button>
                                )}

                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={prevStep}
                                        className="flex-1 py-4 border border-white/10 rounded-xl font-bold hover:bg-white/5 transition-all"
                                    >
                                        EDIT DETAILS
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-[2] btn-primary py-4 flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin" /> : 'CONFIRM & SUBMIT'}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Navigation Controls */}
                        {step < 2 + fields.length && (
                            <div className="flex gap-4 pt-6">
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="px-6 py-4 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-all flex items-center justify-center gap-2"
                                >
                                    <ArrowLeft size={18} /> <span className="hidden md:inline">BACK</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="flex-1 btn-primary py-4 flex items-center justify-center gap-2"
                                >
                                    NEXT STEP <ArrowRight size={18} />
                                </button>
                            </div>
                        )}
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

const Input = React.forwardRef(({ label, icon, error, ...props }, ref) => (
    <div className="space-y-1.5 w-full">
        <label className="text-[10px] md:text-xs font-mono text-gray-500 uppercase tracking-[0.2em]">{label}</label>
        <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 transition-colors group-focus-within:text-neon-blue">
                {icon}
            </div>
            <input
                ref={ref}
                {...props}
                className={`w-full bg-white/5 border ${error ? 'border-red-500/50' : 'border-white/10 group-focus-within:border-neon-blue/50'} 
        rounded-xl py-3.5 md:py-4 pl-12 pr-4 outline-none transition-all placeholder:text-gray-800 text-sm md:text-base`}
            />
        </div>
        {error && (
            <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-[10px] font-mono"
            >
                {error.message}
            </motion.p>
        )}
    </div>
));

export default RegistrationForm;
