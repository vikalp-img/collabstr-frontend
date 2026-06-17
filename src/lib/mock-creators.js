export const MOCK_CREATORS = [
  {
    id: 1,
    name: "Tammslynn",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800&h=1000",
    rating: "5.0",
    badges: [{ type: "top_creator", label: "Top Creator" }],
    bottomBadge: { type: "UGC", label: "UGC" },
    gridImages: true,
    bio: "Lifestyle and beauty creator focused on high-converting UGC and short-form storytelling.",
    location: "Austin, Texas, United States",
    languages: ["English", "Spanish"],
    engagementRate: "4.9%",
    socialAccounts: [
      { platform: "Instagram", handle: "@tammslynn", followers: "182k" },
      { platform: "TikTok", handle: "@tammslynn", followers: "241k" },
      { platform: "YouTube", handle: "@tammslynn", followers: "38k" },
    ],
    portfolio: [
      "Product launch project for skincare brand",
      "Seasonal fashion lookbook reels",
      "Organic short-form UGC for wellness app",
    ],
    services: [
      { title: "Instagram Reel", price: "₹450" },
      { title: "UGC Video (30-60s)", price: "₹600" },
      { title: "Story Bundle (3 frames)", price: "₹280" },
    ],
    reviews: [
      { author: "Glow Labs", rating: "5.0", comment: "Fast delivery and great quality." },
      { author: "Northline", rating: "5.0", comment: "Excellent communication and strong CTR." },
    ],
  },
  {
    id: 2,
    name: "Lauren",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800&h=1000",
    rating: "5.0",
    badges: [{ type: "responds_fast", label: "Responds Fast" }],
    bottomBadge: { type: "UGC", label: "UGC" },
    bio: "Travel and lifestyle creator producing cinematic but authentic brand content.",
    location: "Los Angeles, California, United States",
    languages: ["English"],
    engagementRate: "4.3%",
    socialAccounts: [
      { platform: "Instagram", handle: "@laurentravels", followers: "126k" },
      { platform: "TikTok", handle: "@laurentravels", followers: "310k" },
    ],
    portfolio: [
      "Hotel UGC project across 4 markets",
      "Travel gear affiliate conversion content",
      "Destination mini-vlog series",
    ],
    services: [
      { title: "TikTok Video", price: "₹500" },
      { title: "Instagram Reel", price: "₹420" },
      { title: "UGC Bundle (3 videos)", price: "₹1,200" },
    ],
    reviews: [
      { author: "Skyline Hotels", rating: "5.0", comment: "Delivered above expectations." },
      { author: "Rove Bags", rating: "4.9", comment: "Content quality and hooks were excellent." },
    ],
  },
  {
    id: 3,
    name: "Tay",
    avatar:
      "https://images.unsplash.com/photo-1531123897727-8f129e1bf98c?auto=format&fit=crop&q=80&w=800&h=1000",
    rating: "4.7",
    badges: [],
    bottomBadge: { type: "UGC", label: "UGC" },
    bio: "Fitness and wellness creator helping brands communicate clear product benefits.",
    location: "Chicago, Illinois, United States",
    languages: ["English", "French"],
    engagementRate: "3.8%",
    socialAccounts: [
      { platform: "Instagram", handle: "@taymoves", followers: "94k" },
      { platform: "YouTube", handle: "@taymoves", followers: "52k" },
    ],
    portfolio: [
      "At-home fitness challenge project",
      "Supplements testimonial UGC",
      "Performance apparel try-on series",
    ],
    services: [
      { title: "YouTube Integration", price: "₹900" },
      { title: "Instagram Reel", price: "₹360" },
      { title: "Product Photography", price: "₹250" },
    ],
    reviews: [
      { author: "Peak Nutrition", rating: "4.8", comment: "Reliable and easy to collaborate with." },
      { author: "CoreFlex", rating: "4.7", comment: "Strong audience fit for our niche." },
    ],
  },
  {
    id: 4,
    name: "Tammy Ghawi",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=800&h=1000",
    rating: "5.0",
    badges: [],
    bottomBadge: { type: "instagram", label: "3.1k" },
    bio: "Fashion creator blending editorial style with conversion-focused product storytelling.",
    location: "New York, New York, United States",
    languages: ["English", "Arabic"],
    engagementRate: "5.2%",
    socialAccounts: [
      { platform: "Instagram", handle: "@tammyghawi", followers: "203k" },
      { platform: "TikTok", handle: "@tammyghawi", followers: "87k" },
      { platform: "Pinterest", handle: "@tammyghawi", followers: "34k" },
    ],
    portfolio: [
      "Luxury accessories lookbook project",
      "Beauty product unboxing and demo",
      "Fashion week street-style reel series",
    ],
    services: [
      { title: "Instagram Reel", price: "₹550" },
      { title: "Story Set (5 frames)", price: "₹320" },
      { title: "Styled Product Shoot", price: "₹700" },
    ],
    reviews: [
      { author: "Veloura", rating: "5.0", comment: "Top tier aesthetics and on-time delivery." },
      { author: "Maison Hue", rating: "5.0", comment: "Great creative direction and execution." },
    ],
  },
];

export function getCreatorById(id) {
  return MOCK_CREATORS.find((creator) => creator.id === Number(id));
}
