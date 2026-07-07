'use client';

import { useState } from 'react';
import { siteConfig } from '@/lib/seo/config';
import { Mail, Clock, MessageSquare, Send, User, AtSign, Phone, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ContactSection() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: 'Homepage Contact',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
        type: null,
        message: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
            setSubmitStatus({ type: 'error', message: 'Please fill in all required fields.' });
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus({ type: null, message: '' });

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                setSubmitStatus({ type: 'success', message: 'Message sent successfully! We will get back to you soon.' });
                setFormData({ name: '', email: '', subject: 'Homepage Contact', message: '' });
            } else {
                setSubmitStatus({ type: 'error', message: data.error || 'Failed to send message.' });
            }
        } catch (error) {
            setSubmitStatus({ type: 'error', message: 'An error occurred. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="py-24 bg-white relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-brand-cyan/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-brand-cyan/10 rounded-full blur-3xl -ml-20 -mb-20"></div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col items-center text-center">

                    {/* Left Side: Info */}
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                            viewport={{ once: true }}
                        >
                            <div className="inline-flex items-center gap-2 section-eyebrow mb-6">
                                <MessageSquare className="w-4 h-4" />
                                <span>Contact Us</span>
                            </div>
                            <h2 className="section-title text-4xl md:text-5xl mb-6 leading-tight">
                                Have Questions? <br />
                                <span className="text-brand-accent">Let&apos;s Connect</span>
                            </h2>
                            <p className="text-gray-600 text-lg mb-10 max-w-lg mx-auto">
                                We're here to help you save more. Whether you have a question about a coupon or want to partner with us, our team is ready to assist.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-16">
                                <div className="flex items-center gap-3 group">
                                    <div className="w-10 h-10 bg-brand-cyan/10 rounded-xl flex items-center justify-center text-brand-navy group-hover:bg-brand-navy group-hover:text-white transition-all duration-300">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email</p>
                                        <p className="text-sm font-bold text-gray-900">{siteConfig.email.contact}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 group">
                                    <div className="w-10 h-10 bg-brand-cyan/10 rounded-xl flex items-center justify-center text-brand-navy group-hover:bg-brand-navy group-hover:text-white transition-all duration-300">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Response</p>
                                        <p className="text-sm font-bold text-gray-900">24-48 Hours</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 group">
                                    <div className="w-10 h-10 bg-brand-cyan/10 rounded-xl flex items-center justify-center text-brand-navy group-hover:bg-brand-navy group-hover:text-white transition-all duration-300">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Availability</p>
                                        <p className="text-sm font-bold text-gray-900">24/7 Service</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Side: Form */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="w-full max-w-2xl bg-white rounded-2xl p-8 md:p-10 shadow-[var(--shadow-lg)] border border-[var(--border-subtle)]"
                    >
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-brand-accent transition-colors" />
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="John Doe"
                                            className="input-brand pl-12"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email</label>
                                    <div className="relative group">
                                        <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-brand-accent transition-colors" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="john@example.com"
                                            className="input-brand pl-12"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Message</label>
                                <div className="relative group">
                                    <MessageSquare className="absolute left-4 top-5 w-4 h-4 text-gray-400 group-focus-within:text-brand-accent transition-colors" />
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        rows={4}
                                        placeholder="Tell us how we can help..."
                                        className="input-brand pl-12 resize-none"
                                        required
                                    />
                                </div>
                            </div>

                            {submitStatus.message && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`p-4 rounded-2xl border flex items-center gap-3 ${submitStatus.type === 'success' ? 'bg-brand-cyan/10 border-brand-cyan/20 text-brand-red' : 'bg-red-50 border-red-100 text-red-600'
                                        }`}
                                >
                                    {submitStatus.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                    <span className="text-sm font-bold">{submitStatus.message}</span>
                                </motion.div>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 btn-primary text-base disabled:opacity-50 disabled:translate-y-0"
                            >
                                {isSubmitting ? (
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        Send Message
                                        <Send className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
