import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Zap, Award, Camera, Instagram, Star, Music2, Youtube, Twitter } from "lucide-react";

export default function InfluencerCard({ creator, onFavorite, isFavorite = false, onProfileClick }) {
  const getFallbackImg = () => {
    const gender = String(creator.gender || creator.creatorProfile?.gender || "").toLowerCase();
    if (gender === "male" || gender === "boy" || gender === "men") {
      return "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80";
    }
    return "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80";
  };
  const fallbackImg = getFallbackImg();
  const [imgSrc, setImgSrc] = useState(creator.avatar || fallbackImg);

  return (
    <div className="relative h-[420px] rounded-xl overflow-hidden group cursor-pointer bg-gray-100/50 block">
      {/* ... previous image logic ... */}
      {creator.gridImages ? (
        <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-[2px] bg-white group-hover:scale-105 transition-transform duration-700">
          <Image
            src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop"
            className="w-full h-[210px] object-cover"
            alt=""
           title="Image"  width={800}  height={800}  fetchPriority="auto" />
          <Image
            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop"
            className="w-full h-[210px] object-cover"
            alt=""
           title="Image"  width={800}  height={800}  fetchPriority="auto" />
          <Image
            src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop"
            className="w-full h-[210px] object-cover"
            alt=""
           title="Image"  width={800}  height={800}  fetchPriority="auto" />
          <Image
            src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop"
            className="w-full h-[210px] object-cover"
            alt=""
           title="Image"  width={800}  height={800}  fetchPriority="auto" />
        </div>
      ) : (
        <Image
          src={imgSrc || fallbackImg}
          alt={creator.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          title="Image" 
          width={800} 
          height={800} 
          fetchPriority="auto"
          onError={() => setImgSrc(fallbackImg)}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent opacity-60 pointer-events-none"></div>

      <div className="absolute top-[12px] left-[12px] flex flex-col gap-2 z-10">
        {creator.badges?.map((badge, idx) => (
          <div
            key={idx}
            className="bg-black/60 backdrop-blur-md text-white/90 text-[11px] font-semibold px-2.5 py-[5px] rounded-md flex items-center gap-1.5"
          >
            {badge.type === "top_creator" && (
              <Award className="w-[14px] h-[14px] shrink-0 text-pink-500" />
            )}
            {badge.type === "responds_fast" && (
              <Zap className="w-[14px] h-[14px] shrink-0 text-green-400 fill-green-400" />
            )}
            {badge.label}
          </div>
        ))}
      </div>

    <button 
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onFavorite) onFavorite(creator);
      }}
      className="absolute top-[14px] right-[14px] z-30"
    >
      <Heart 
        className={`w-[22px] h-[22px] shrink-0 text-white stroke-[2px] transition-all duration-300 ${isFavorite ? "fill-white" : "hover:fill-white"}`} 
      />
    </button>

      <div className="absolute bottom-[14px] left-[14px] right-[14px] flex flex-col justify-end z-10">
        {creator.bottomBadge && (
          <div className="bg-white text-gray-900 font-bold text-[11px] px-[6px] py-[3px] rounded mb-[6px] w-fit flex items-center gap-1">
            {creator.bottomBadge.type === "instagram" && (
              <div className="bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 rounded text-white p-[2px]">
                <Instagram className="w-[10px] h-[10px] shrink-0" strokeWidth={2.5} />
              </div>
            )}

            {creator.bottomBadge.type === "tiktok" && (
              <div className="bg-[#000000] rounded text-white p-[2px]">
                <Music2 className="w-[10px] h-[10px] shrink-0" strokeWidth={2.5} />
              </div>
            )}

            {creator.bottomBadge.type === "youtube" && (
              <div className="bg-[#FF0000] rounded text-white p-[2px]">
                <Youtube className="w-[10px] h-[10px] shrink-0" strokeWidth={2.5} />
              </div>
            )}

            {creator.bottomBadge.type === "twitter" && (
              <div className="bg-[#1DA1F2] rounded text-white p-[2px]">
                <Twitter className="w-[10px] h-[10px] shrink-0" strokeWidth={2.5} />
              </div>
            )}

            {creator.bottomBadge.type === "UGC" && (
              <Camera className="w-[12px] h-[12px] shrink-0 text-gray-800" strokeWidth={2.5} />
            )}
            <span className="leading-none pt-px">{creator.bottomBadge.label}</span>
          </div>
        )}

        <div className="flex items-center gap-[6px] text-white">
          <span className="font-bold text-[17px] tracking-tight">{creator.name}</span>
          <div className="flex items-center gap-0.5 mt-0.5 text-yellow-500">
            < Star className="w-[13px] h-[13px] shrink-0 fill-current" />
            <span className="font-semibold text-[13px] text-white">{creator.rating}</span>
          </div>
        </div>
      </div>

      {onProfileClick ? (
        <div
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onProfileClick(creator.id);
          }}
          className="absolute inset-0 z-20 cursor-pointer"
          aria-label={`View ${creator.name} profile`}
        />
      ) : (
        <Link
          href={`/creators/${creator.id}`}
          className="absolute inset-0 z-20"
          aria-label={`View ${creator.name} profile`}
        />
      )}
    </div>
  );
}
