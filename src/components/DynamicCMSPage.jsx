"use client";

import React, { useState, useEffect } from "react";
import { apiWithoutAuth } from "@/lib/apiService";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Loader2, Shield, Lock, FileText, Clock, Info, HelpCircle } from "lucide-react";

/**
 * Reusable dynamic CMS page component.
 * @param {Object} props
 * @param {string} props.title - The title of the page.
 * @param {string} props.cmsType - The 'type' query parameter for the /cms API.
 * @param {React.ReactNode} props.icon - The Lucide icon to display in the header.
 */
const DynamicCMSPage = ({ title, highlightWord, cmsType, icon: Icon = FileText }) => {
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCMSContent = async () => {
            try {
                const response = await apiWithoutAuth.get(API_ENDPOINTS.CMS, {
                    params: { type: cmsType }
                });
                const data = response?.data?.data || response?.data;
                setContent(data);
            } catch (error) {
                console.error(`Error fetching CMS content (${cmsType}):`, error);
            } finally {
                setLoading(false);
            }
        };

        fetchCMSContent();
    }, [cmsType]);

    const getHtmlContent = () => {
        if (!content) return "";
        if (typeof content === 'string') return content;
        return content.description || content.content || "Empty content.";
    };

    return (
        <main className="min-h-screen bg-white">
            <Header />
            
            <section className="relative overflow-hidden bg-gradient-to-b from-purple-50/50 via-white to-white px-4 pt-32 pb-16 text-center">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-purple-100/30 blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-pink-100/30 blur-3xl" />
                </div>

                <div className="container mx-auto max-w-4xl">
                    <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 text-sm font-medium text-purple-600 mb-6 animate-fade-in">
                        <Icon className="h-4 w-4" />
                        {title}
                    </div>
                    <h1 className="text-4xl font-bold leading-tight text-gray-900 md:text-5xl lg:text-6xl mb-6">
                        {title.split(' ').map((word, i) => (
                            <span key={i} className={word.toLowerCase() === highlightWord.toLowerCase() ? "bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent" : ""}>
                                {word}{' '}
                            </span>
                        ))}
                    </h1>
                </div>
            </section>

            <section className="px-4 pb-32">
                <div className="container mx-auto max-w-4xl">
                    <div className="group relative rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl transition-all sm:p-12 hover:shadow-purple-100/50 overflow-hidden">
                        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-purple-50/20 blur-3xl group-hover:bg-purple-100/30 transition-colors" />
                        
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
                                <p className="text-gray-500 font-medium">Loading content...</p>
                            </div>
                        ) : content ? (
                            <div className="relative z-10 prose prose-purple max-w-none">
                                <div className="mb-10 flex flex-wrap gap-4 sm:gap-6 text-sm text-gray-500 border-b border-gray-100 pb-8">
                                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full">
                                        <Clock className="h-4 w-4 text-purple-500" />
                                        <span>Last Updated: {new Date(content.updatedAt || content.createdAt || Date.now()).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full">
                                        <Info className="h-4 w-4 text-blue-500" />
                                        <span>Standard Template</span>
                                    </div>
                                </div>
                                
                                <div 
                                    className="dynamic-content text-gray-700 leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: getHtmlContent() }}
                                />
                            </div>
                        ) : (
                            <div className="text-center py-20 border border-dashed border-gray-200 rounded-3xl bg-gray-50/30">
                                <p className="text-gray-500 max-w-xs mx-auto">Content is currently being updated. Please contact support if you need assistance.</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <Footer />

            <style jsx global>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
                .dynamic-content h1 { font-size: 2.25rem; font-weight: 800; color: #111827; margin: 2.5rem 0 1.5rem; letter-spacing: -0.025em; }
                .dynamic-content h2 { font-size: 1.75rem; font-weight: 700; color: #111827; margin: 2rem 0 1.25rem; }
                .dynamic-content h3 { font-size: 1.25rem; font-weight: 600; color: #111827; margin: 1.5rem 0 1rem; }
                .dynamic-content p { margin-bottom: 1.25rem; color: #4b5563; font-size: 1.05rem; line-height: 1.6; }
                .dynamic-content ul, .dynamic-content ol { margin-bottom: 1.25rem; padding-left: 1.5rem; color: #4b5563; }
                .dynamic-content li { margin-bottom: 0.5rem; }
                .dynamic-content strong { font-weight: 700; color: #111827; }
                .dynamic-content a { color: #8b5cf6; text-decoration: underline; transition: all 0.2s; font-weight: 500; }
                .dynamic-content a:hover { color: #7c3aed; }
            `}</style>
        </main>
    );
};

export default DynamicCMSPage;
