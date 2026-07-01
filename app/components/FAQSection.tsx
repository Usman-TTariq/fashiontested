'use client';

import { useEffect, useState } from 'react';
import { getActiveFAQs, FAQ } from '@/lib/services/faqService';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FAQSection() {
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    useEffect(() => {
        const fetchFaqs = async () => {
            setLoading(true);
            try {
                const data = await getActiveFAQs();
                setFaqs(data.slice(0, 6)); // Show first 6 FAQs on homepage
            } catch (error) {
                console.error('Error fetching FAQs:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchFaqs();
    }, []);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    if (!loading && faqs.length === 0) return null;

    return (
        <section className="home-section bg-white section-divider">
            <div className="home-container">
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="section-eyebrow mb-4"
                    >
                        <HelpCircle className="w-4 h-4" />
                        <span>Common Questions</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        viewport={{ once: true }}
                        className="section-title text-4xl md:text-5xl mt-4 mb-4"
                    >
                        Frequently Asked Questions
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="text-gray-600 max-w-2xl mx-auto text-lg"
                    >
                        Everything you need to know about using Favento and getting the best deals.
                    </motion.p>
                </div>

                <div className="max-w-3xl mx-auto">
                    {loading ? (
                        <div className="space-y-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-16 bg-white rounded-2xl animate-pulse shadow-sm" />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {faqs.map((faq, index) => (
                                <motion.div
                                    key={faq.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    className={`bg-white rounded-xl border transition-all duration-300 ${openIndex === index
                                            ? 'border-brand-navy shadow-lg shadow-brand-navy/5'
                                            : 'border-gray-100 shadow-sm hover:border-brand-red/40'
                                        }`}
                                >
                                    <button
                                        onClick={() => toggleFAQ(index)}
                                        className="w-full px-6 py-5 text-left flex items-center justify-between group"
                                    >
                                        <span className={`text-lg font-bold transition-colors ${openIndex === index ? 'text-brand-navy' : 'text-gray-900'
                                            }`}>
                                            {faq.question}
                                        </span>
                                        <div className={`p-2 rounded-full transition-all duration-300 ${openIndex === index ? 'bg-brand-navy text-white' : 'bg-gray-50 text-gray-400 group-hover:text-brand-navy'
                                            }`}>
                                            <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''
                                                }`} />
                                        </div>
                                    </button>

                                    <AnimatePresence>
                                        {openIndex === index && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-6 pb-6 pt-0">
                                                    <div className="pt-4 border-t border-gray-50">
                                                        <p className="text-gray-600 leading-relaxed text-base">
                                                            {faq.answer}
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        viewport={{ once: true }}
                        className="text-center mt-12"
                    >
                        <a
                            href="/faqs"
                            className="inline-flex items-center gap-2 text-[#C7395F] font-bold hover:underline group"
                        >
                            View all FAQs
                            <ChevronDown className="w-4 h-4 -rotate-90 group-hover:translate-x-1 transition-transform" />
                        </a>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
