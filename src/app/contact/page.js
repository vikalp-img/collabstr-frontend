"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  Mail, 
  MapPin, 
  Phone, 
  Send, 
  MessageSquare, 
  User, 
  Globe,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { theme } from "@/theme";
import { toast } from "sonner";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    toast.success("Message sent successfully! We'll get back to you soon.");
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      content: "support@hiresphere.com",
      description: "Our team will respond within 24 hours.",
      gradient: "from-purple-500 to-indigo-500"
    },
    {
      icon: Phone,
      title: "Call Us",
      content: "+1 (888) 123-4567",
      description: "Mon-Fri from 9am to 6pm PST.",
      gradient: "from-pink-500 to-rose-500"
    },
    {
      icon: MapPin,
      title: "Visit Us",
      content: "San Francisco, CA",
      description: "Headquarters in the heart of Silicon Valley.",
      gradient: "from-amber-500 to-orange-500"
    }
  ];

  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-purple-50/50 via-white to-white px-4 pt-32 pb-16 text-center">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-purple-100/30 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-pink-100/30 blur-3xl" />
        </div>

        <div className="container mx-auto max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 text-sm font-medium text-purple-600 mb-6 animate-fade-in">
            <MessageSquare className="h-4 w-4" />
            Contact Us
          </div>
          <h1 className={`${theme.typography.h1} mb-6`}>
            Get in{" "}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              touch
            </span>
          </h1>
          <p className={`${theme.typography.subtitle} max-w-2xl mx-auto`}>
            Have questions about HireSphere? We're here to help you connect with the best creators or find your perfect brand partnership.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-4 pb-32">
        <div className="container mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-3">
            {/* Contact Info Cards */}
            <div className="space-y-6">
              {contactInfo.map((info, i) => (
                <div key={i} className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-8 shadow-xl transition-all hover:shadow-2xl hover:-translate-y-1">
                  <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${info.gradient} opacity-5 blur-2xl transition-opacity group-hover:opacity-10`} />
                  
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${info.gradient} text-white shadow-lg mb-6`}>
                    <info.icon className="h-6 w-6" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{info.title}</h3>
                  <p className="text-lg font-semibold text-purple-600 mb-1">{info.content}</p>
                  <p className="text-sm text-gray-500">{info.description}</p>
                </div>
              ))}

              <div className="rounded-3xl bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-white shadow-xl">
                <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Global Support
                </h4>
                <p className="text-purple-100 text-sm leading-relaxed mb-6">
                  We support brands and creators in over 50 countries. Our global team is ready to assist you no matter your time zone.
                </p>
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden shadow-sm">
                      <img 
                        src={`https://i.pravatar.cc/100?img=${i + 10}`} 
                        alt="Support Team" 
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                  <div className="h-10 w-10 rounded-full border-2 border-white bg-white/20 backdrop-blur-sm flex items-center justify-center text-[10px] font-bold">
                    +12
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-8 shadow-2xl md:p-12">
                <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-purple-50/50 blur-3xl" />
                <div className="absolute -left-20 -bottom-20 h-96 w-96 rounded-full bg-pink-50/50 blur-3xl" />
                
                {isSubmitted ? (
                  <div className="relative z-10 py-20 text-center animate-fade-in">
                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-500 mb-8 shadow-lg">
                      <CheckCircle2 className="h-10 w-10" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Message Sent!</h2>
                    <p className="text-gray-600 mb-10 max-w-sm mx-auto font-medium">
                      Thank you for reaching out. We've received your inquiry and will be in touch shortly.
                    </p>
                    <button 
                      onClick={() => setIsSubmitted(false)}
                      className={theme.buttons.secondary}
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 ml-1 flex items-center gap-2">
                        <User className="h-4 w-4 text-purple-500" />
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="John Doe"
                        className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 px-6 py-4 text-gray-900 transition-all focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-purple-500/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 ml-1 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-purple-500" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="john@example.com"
                        className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 px-6 py-4 text-gray-900 transition-all focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-purple-500/10"
                      />
                    </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 ml-1">Subject</label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        placeholder="How can we help?"
                        className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 px-6 py-4 text-gray-900 transition-all focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-purple-500/10"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 ml-1">Message</label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        placeholder="Tell us what's on your mind..."
                        className="w-full resize-none rounded-2xl border border-gray-100 bg-gray-50/50 px-6 py-4 text-gray-900 transition-all focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-purple-500/10"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="group relative w-full flex items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-5 text-lg font-bold text-white shadow-xl shadow-purple-200 transition-all hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-6 w-6 animate-spin" />
                          Sending Message...
                        </>
                      ) : (
                        <>
                          <Send className="h-6 w-6 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                          Send Message
                        </>
                      )}
                    </button>
                    
                    <p className="text-center text-xs text-gray-400 mt-4">
                      By clicking "Send Message", you agree to our Terms of Service and Privacy Policy.
                    </p>
                  </form>
                )}
              </div>
            </div>
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
      `}</style>
    </main>
  );
}
