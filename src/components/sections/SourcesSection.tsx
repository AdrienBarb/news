import {
  Twitter,
  Newspaper,
  Rss,
  Video,
  Podcast,
  MessageSquare,
  Globe,
  Hash,
} from "lucide-react";

export default function SourcesSection() {
  return (
    <section className="relative py-48 overflow-hidden bg-white">
      {/* Animated Background Icons */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        {/* Left Side Logos */}
        <div className="absolute top-[15%] left-[5%] animate-float">
          <div className="flex items-center gap-3 bg-gradient-to-br from-[#0ea5e9] to-[#06b6d4] rounded-full px-8 py-4 shadow-lg">
            <Newspaper className="w-7 h-7 text-white" />
            <span className="font-semibold text-white">TechCrunch</span>
          </div>
        </div>

        <div className="absolute top-[35%] left-[8%] animate-float animation-delay-2000">
          <div className="flex items-center gap-3 bg-gradient-to-br from-[#ff4500] to-[#ff6a33] rounded-full px-8 py-4 shadow-lg">
            <MessageSquare className="w-7 h-7 text-white" />
            <span className="font-semibold text-white">Reddit</span>
          </div>
        </div>

        <div className="absolute top-[55%] left-[3%] animate-float animation-delay-1000">
          <div className="flex items-center gap-3 bg-gradient-to-br from-[#fa4616] to-[#d63a0f] rounded-full px-8 py-4 shadow-lg">
            <Newspaper className="w-7 h-7 text-white" />
            <span className="font-semibold text-white">The Verge</span>
          </div>
        </div>

        <div className="absolute top-[75%] left-[7%] animate-float">
          <div className="flex items-center gap-3 bg-gradient-to-br from-[#9333ea] to-[#7e22ce] rounded-full px-8 py-4 shadow-lg">
            <Podcast className="w-7 h-7 text-white" />
            <span className="font-semibold text-white">Podcasts</span>
          </div>
        </div>

        <div className="absolute top-[25%] left-[10%] animate-float animation-delay-1500">
          <div className="flex items-center gap-3 bg-gradient-to-br from-[#f59e0b] to-[#d97706] rounded-full px-8 py-4 shadow-lg">
            <Rss className="w-7 h-7 text-white" />
            <span className="font-semibold text-white">RSS Feeds</span>
          </div>
        </div>

        <div className="absolute top-[65%] left-[12%] animate-float animation-delay-2000">
          <div className="flex items-center gap-3 bg-gradient-to-br from-[#059669] to-[#047857] rounded-full px-8 py-4 shadow-lg">
            <Globe className="w-7 h-7 text-white" />
            <span className="font-semibold text-white">VentureBeat</span>
          </div>
        </div>

        {/* Right Side Logos */}
        <div className="absolute top-[20%] right-[5%] animate-float animation-delay-1000">
          <div className="flex items-center gap-3 bg-gradient-to-br from-[#1d9bf0] to-[#0c7abf] rounded-full px-8 py-4 shadow-lg">
            <Twitter className="w-7 h-7 text-white" />
            <span className="font-semibold text-white">Twitter</span>
          </div>
        </div>

        <div className="absolute top-[40%] right-[8%] animate-float">
          <div className="flex items-center gap-3 bg-gradient-to-br from-[#ff0000] to-[#cc0000] rounded-full px-8 py-4 shadow-lg">
            <Video className="w-7 h-7 text-white" />
            <span className="font-semibold text-white">YouTube</span>
          </div>
        </div>

        <div className="absolute top-[60%] right-[3%] animate-float animation-delay-2000">
          <div className="flex items-center gap-3 bg-gradient-to-br from-[#ff6600] to-[#ff8533] rounded-full px-8 py-4 shadow-lg">
            <Hash className="w-7 h-7 text-white" />
            <span className="font-semibold text-white">Hacker News</span>
          </div>
        </div>

        <div className="absolute top-[80%] right-[7%] animate-float animation-delay-1000">
          <div className="flex items-center gap-3 bg-gradient-to-br from-[#c2410c] to-[#9a3412] rounded-full px-8 py-4 shadow-lg">
            <Globe className="w-7 h-7 text-white" />
            <span className="font-semibold text-white">Ars Technica</span>
          </div>
        </div>

        <div className="absolute top-[30%] right-[10%] animate-float animation-delay-1500">
          <div className="flex items-center gap-3 bg-gradient-to-br from-[#000000] to-[#404040] rounded-full px-8 py-4 shadow-lg">
            <Newspaper className="w-7 h-7 text-white" />
            <span className="font-semibold text-white">Wired</span>
          </div>
        </div>

        <div className="absolute top-[70%] right-[12%] animate-float animation-delay-2000">
          <div className="flex items-center gap-3 bg-gradient-to-br from-[#dc2626] to-[#b91c1c] rounded-full px-8 py-4 shadow-lg">
            <Newspaper className="w-7 h-7 text-white" />
            <span className="font-semibold text-white">MIT Tech Review</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-4xl lg:text-5xl xl:text-6xl text-[#2f2f2f]">
            We scan everything — so you don&apos;t have to.
          </h2>

          <p className="text-xl lg:text-2xl text-[#2f2f2f]/70 leading-relaxed">
            We monitor tech news across leading publications, social platforms,
            and newsletters — then filter it down to what actually matters.
          </p>
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-transparent pointer-events-none"></div>
    </section>
  );
}
