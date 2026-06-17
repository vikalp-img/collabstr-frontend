"use client";
import Image from "next/image";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Loader2, 
  Search, 
  ChevronRight, 
  Calendar, 
  User, 
  ArrowRight,
  TrendingUp,
  BookOpen
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { apiWithoutAuth } from "@/lib/apiService";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";
import { toast } from "sonner";
import PageLoader from "@/components/PageLoader";
import Newsletter from "@/components/Newsletter";

const BlogCard = ({ blog }) => {
  return (
    <Link 
      href={`/blog/${blog?._id || blog?.id}`}
      className="group flex flex-col bg-white rounded-3xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:-translate-y-1"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image 
          src={blog?.image?.url || blog?.media?.url || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80"} 
          alt={blog?.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
         title="Image"  width={800}  height={800}  fetchPriority="auto" />
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-gray-900 uppercase tracking-widest">
            {blog?.category || "Influencer Marketing"}
          </span>
        </div>
      </div>
      
      <div className="flex flex-col flex-1 p-6 sm:p-8">
        <div className="flex items-center gap-4 text-xs font-medium text-gray-500 mb-4">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {blog?.createdAt ? new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Recently"}
          </div>
          <div className="w-1 h-1 rounded-full bg-gray-300" />
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            {blog?.author || "HireSphere Team"}
          </div>
        </div>
        
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors line-clamp-2 leading-snug">
          {blog?.title || "How to Scale Your Brand with Influencer Marketing"}
        </h3>
        
        <p className="text-gray-600 line-clamp-3 mb-6 flex-1 text-sm sm:text-base leading-relaxed">
          {blog?.description || blog?.excerpt || "Discover the latest strategies and tips to grow your brand through effective influencer collaborations and social media marketing."}
        </p>
        
        <div className="flex items-center text-sm font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
          Read Story
          <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
};

export default function BlogListPage() {
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalBlogs: 0
  });

  const fetchBlogs = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await apiWithoutAuth.get(API_ENDPOINTS.BLOG, {
        params: { page, limit: 12 }
      });
      
      const apiResponse = response.data;
      if (apiResponse.success && apiResponse.data) {
        setBlogs(apiResponse.data.blogs || []);
        if (apiResponse.data.pagination) {
          setPagination({
            currentPage: apiResponse.data.pagination.currentPage,
            totalPages: apiResponse.data.pagination.totalPages,
            totalBlogs: apiResponse.data.pagination.totalBlogs
          });
        }
      } else {
        setBlogs([]);
      }
      setError(null);
    } catch (err) {
      console.error("Failed to fetch blogs:", err);
      setError("Failed to load blog posts. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs(pagination.currentPage);
  }, [pagination.currentPage]);

  const filteredBlogs = (blogs || []).filter(blog => 
    blog?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const featuredBlog = blogs?.[0];
  const regularBlogs = blogs?.slice(1) || [];

  return (
    <main className="min-h-screen bg-[#fafafa]">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 sm:pt-48 sm:pb-32 overflow-hidden bg-white">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-pink-50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 opacity-60 pointer-events-none" />
        
        <div className="container mx-auto max-w-7xl px-4 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 rounded-full text-purple-700 text-xs font-bold uppercase tracking-widest mb-6 border border-purple-100">
              <BookOpen className="w-3.5 h-3.5" />
              Our Stories
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6 tracking-tight leading-[1.1]">
              The HireSphere <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Blog</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-10 leading-relaxed font-medium">
              Your ultimate resource for influencer marketing strategies, creator tips, and brand growth insights.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-lg group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors group-focus-within:text-purple-600" />
              <input 
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all text-gray-800 placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Blogs Content */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto max-w-7xl px-4">
          {isLoading ? (
            <PageLoader message="Curating our best stories for you..." />
          ) : error ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-200 shadow-sm max-w-2xl mx-auto">
              <p className="text-gray-900 font-semibold mb-4 text-lg">{error}</p>
              <button 
                onClick={fetchBlogs}
                className="px-8 py-3 bg-gray-900 text-white rounded-full font-bold hover:bg-black transition-all shadow-lg hover:shadow-xl active:scale-95"
               type="button">
                Try To Refresh
              </button>
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <p className="text-gray-500 text-xl font-medium">No blog posts found at the moment.</p>
            </div>
          ) : (
            <div className="space-y-16">
              {/* Featured Post (only if no search query) */}
              {!searchQuery && featuredBlog && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                  <Link 
                    href={`/blog/${featuredBlog?._id || featuredBlog?.id}`}
                    className="relative aspect-[16/10] sm:aspect-video rounded-[2.5rem] overflow-hidden group shadow-2xl"
                  >
                    <Image 
                      src={featuredBlog?.image?.url || featuredBlog?.media?.url || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80"} 
                      alt={featuredBlog?.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                     title="Image"  width={800}  height={800}  fetchPriority="auto" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </Link>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs font-bold uppercase tracking-widest border border-purple-200">
                        {featuredBlog?.category || "Featured Article"}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                        <TrendingUp className="w-4 h-4 text-pink-500" />
                        Most Read
                      </div>
                    </div>
                    <Link href={`/blog/${featuredBlog?._id || featuredBlog?.id}`} className="group">
                      <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-6 tracking-tight leading-tight group-hover:text-purple-600 transition-colors">
                        {featuredBlog?.title}
                      </h2>
                    </Link>
                    <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed line-clamp-3">
                      {featuredBlog?.description || featuredBlog?.excerpt || "Discover the secrets of influencer marketing and how it's shaping the future of digital branding in this comprehensive guide."}
                    </p>
                    <div className="flex items-center gap-4 mb-10 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm w-fit">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
                        {(featuredBlog?.author || "C")[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 leading-none mb-1">{featuredBlog?.author || "HireSphere Editorial"}</p>
                        <p className="text-xs text-gray-500 font-medium">{featuredBlog?.createdAt ? new Date(featuredBlog.createdAt).toLocaleDateString() : "Just now"} • 8 min read</p>
                      </div>
                    </div>
                    <Link 
                      href={`/blog/${featuredBlog?._id || featuredBlog?.id}`}
                      className="inline-flex items-center justify-center px-10 py-5 bg-gray-900 text-white rounded-full font-bold hover:bg-black transition-all shadow-xl hover:shadow-2xl active:scale-95 group w-fit"
                    >
                      Read Full Article
                      <ArrowRight className="w-5 h-5 ml-3 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              )}

              {/* Blog Grid */}
              <div className="space-y-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                    {searchQuery ? `Search Results for "${searchQuery}"` : "Latest Stories"}
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {(searchQuery ? filteredBlogs : regularBlogs).map((blog) => (
                    <BlogCard key={blog?._id || blog?.id} blog={blog} />
                  ))}
                </div>
                
                {/* Pagination UI */}
                {!isLoading && !error && (searchQuery ? filteredBlogs : regularBlogs).length > 0 && pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 sm:gap-4 mt-20 pt-10 border-t border-gray-100">
                    <button
                      disabled={pagination.currentPage === 1}
                      onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.max(prev.currentPage - 1, 1) }))}
                      className="p-3 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                      <ChevronRight className="w-5 h-5 rotate-180" />
                    </button>
                    
                    <div className="flex items-center gap-2">
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setPagination(prev => ({ ...prev, currentPage: page }))}
                          className={`w-11 h-11 rounded-full text-sm font-bold transition-all ${
                            pagination.currentPage === page 
                            ? "bg-gray-900 text-white shadow-lg" 
                            : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      disabled={pagination.currentPage === pagination.totalPages}
                      onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.min(prev.currentPage + 1, pagination.totalPages) }))}
                      className="p-3 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
                
                {(searchQuery ? filteredBlogs : regularBlogs).length === 0 && searchQuery && (
                  <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                    <p className="text-gray-500 text-lg">No matches found for your search. Try different keywords.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <Newsletter />

      <Footer />
    </main>
  );
}
