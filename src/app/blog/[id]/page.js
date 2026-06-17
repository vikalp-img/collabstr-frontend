"use client";
import Image from "next/image";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Loader2, 
  Calendar, 
  User, 
  ArrowLeft,
  ArrowRight,
  Share2,
  Bookmark,
  MessageCircle,
  Clock,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { apiWithoutAuth } from "@/lib/apiService";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";
import { toast } from "sonner";
import PageLoader from "@/components/PageLoader";

export default function BlogDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [blog, setBlog] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogDetail = async () => {
      setIsLoading(true);
      try {
        const response = await apiWithoutAuth.get(`${API_ENDPOINTS.BLOG}/${id}`);
        const apiResponse = response.data;
        if (apiResponse.success && apiResponse.data) {
          setBlog(apiResponse.data);
          setError(null);
        } else {
          setError("Blog post not found.");
        }
      } catch (err) {
        console.error("Failed to fetch blog detail:", err);
        setError("Blog post not found or something went wrong.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchBlogDetail();
    }
  }, [id]);

  if (isLoading) {
    return (
      <main className="min-h-screen flex flex-col bg-white">
        <Header />
        <PageLoader message="Fetching the story for you..." />
        <Footer />
      </main>
    );
  }

  if (error || !blog) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto max-w-2xl px-4 py-32 text-center">
            <div className="bg-red-50 text-red-600 p-6 rounded-3xl mb-8 font-medium border border-red-100">
                {error || "We couldn't find the story you were looking for."}
            </div>
            <Link 
                href="/blog" 
                className="inline-flex items-center text-gray-900 font-bold hover:text-purple-600 transition-colors"
            >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to all stories
            </Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      {/* Blog Hero */}
      <article className="pt-32 pb-20 overflow-hidden">
        <div className="container mx-auto max-w-4xl px-4">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-8 overflow-x-auto whitespace-nowrap pb-2">
            <Link href="/" className="hover:text-purple-600 transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
            <Link href="/blog" className="hover:text-purple-600 transition-colors">Blog</Link>
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
            <span className="text-gray-900 truncate">{blog.title}</span>
          </nav>

          {/* Header Info */}
          <div className="mb-12">
            <div className="inline-flex items-center px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs font-bold uppercase tracking-widest mb-8 border border-purple-200">
                {blog.category || "General"}
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-8 leading-[1.1] tracking-tight">
              {blog.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-sm font-semibold text-gray-600 border-y border-gray-100 py-6">
                <div className="flex items-center gap-3">
                    <div>
                        <p className="text-gray-900 font-bold leading-tight">{blog.author || "HireSphere Editorial"}</p>
                        <p className="text-xs text-gray-500 font-medium">Author</p>
                    </div>
                </div>
                <div className="w-px h-8 bg-gray-100 hidden sm:block" />
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-600" />
                    {blog.readTime || "5 min read"}
                </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="relative aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl mb-16 group">
            <Image 
              src={blog.image?.url || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80"} 
              alt={blog.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
             title="Image"  width={1200}  height={675}  priority />
          </div>

          {/* Social Share & Floating Actions */}
          <div className="flex items-center justify-between mb-16 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-4">
                <button 
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("Link copied to clipboard!");
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm active:scale-95"
                >
                    <Share2 className="w-4 h-4" />
                    Share
                </button>
                <button type="button" className="p-2 bg-white rounded-xl border border-gray-200 text-gray-700 hover:text-purple-600 transition-all shadow-sm hover:border-purple-200">
                    <Bookmark className="w-5 h-5" />
                </button>
            </div>
            <button type="button" className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
                <MessageCircle className="w-5 h-5" />
                0 Comments
            </button>
          </div>

          {/* Content */}
          <div className="prose prose-purple prose-lg max-w-none prose-headings:font-bold prose-p:text-gray-600 prose-p:leading-relaxed prose-a:text-purple-600 prose-strong:text-gray-900 prose-img:rounded-3xl">
            {blog.content ? (
                // If it looks like HTML, render it as such, otherwise treat as text with whitespace preservation
                blog.content.includes('<') && blog.content.includes('>') ? (
                    <div dangerouslySetInnerHTML={{ __html: blog.content }} />
                ) : (
                    <div className="whitespace-pre-wrap">
                        {blog.content}
                    </div>
                )
            ) : (
                <div className="space-y-6">
                    <p className="text-xl leading-relaxed text-gray-700 font-medium">
                        {blog.description || "Stay tuned for the full story."}
                    </p>
                    <p>
                        HireSphere is dedicated to bringing you the best insights into the creator economy.
                    </p>
                </div>
            )}
          </div>

          {/* Bottom Navigation */}
          <div className="mt-20 pt-12 border-t border-gray-100 flex items-center justify-between gap-4">
             <Link 
                href="/blog" 
                className="group flex flex-col"
             >
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Previous Category</span>
                <span className="flex items-center font-bold text-gray-900 group-hover:text-purple-600 transition-colors shadow-none">
                    <ArrowLeft className="w-5 h-5 mr-3 transition-transform group-hover:-translate-x-1" />
                    All Stories
                </span>
             </Link>
             
             <div className="hidden sm:flex gap-3">
                <button type="button" className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-md active:scale-95">
                    Follow
                </button>
             </div>
          </div>
        </div>
      </article>



      <Footer />
    </main>
  );
}
