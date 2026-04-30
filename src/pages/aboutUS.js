import React from 'react';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-white font-sans">
      
      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        <img 
          src="https://plus.unsplash.com/premium_photo-1679428401908-1ebebf678cb4?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
          alt="Farmer harvesting fresh produce"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-6 py-2 rounded-full mb-6">
            <span className="text-green-400">🌱</span>
            <span className="uppercase tracking-widest text-sm font-medium">Direct from Farm to Home</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold leading-tight mb-6">
            Bridging Farms<br />to Families
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
            Fair prices for farmers. Fresh, organic food for you.
          </p>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/70 rounded-full flex items-center justify-center">
            <div className="w-1 h-2 bg-white/70 rounded-full animate-scroll"></div>
          </div>
        </div>
      </div>

      {/* Introduction */}
      <div className="max-w-5xl mx-auto px-6 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-5xl font-semibold text-gray-900 mb-8">
            A Better Way to Connect
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Farmers work hard but often receive unfair prices. Consumers want fresh, 
            chemical-free food but struggle to find it. FarmBridge fixes this broken system 
            by connecting both sides directly.
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="bg-gray-50 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-5">
              <div className="sticky top-24">
                <span className="text-green-600 font-medium tracking-wider">OUR MISSION</span>
                <h2 className="text-5xl font-semibold text-gray-900 mt-4 leading-tight">
                  Direct. Fair.<br />Sustainable.
                </h2>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-10 text-lg text-gray-600">
              <p>
                We are building a transparent marketplace that removes unnecessary middlemen 
                so farmers earn what they deserve and consumers get truly fresh, organic produce.
              </p>
              <div className="grid md:grid-cols-3 gap-8 pt-6">
                <div>
                  <div className="text-green-600 text-4xl mb-3">🌾</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Fair Income</h3>
                  <p className="text-sm">Farmers receive transparent, direct payments</p>
                </div>
                <div>
                  <div className="text-green-600 text-4xl mb-3">🥕</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Fresh & Pure</h3>
                  <p className="text-sm">Consumers enjoy chemical-free, farm-fresh food</p>
                </div>
                <div>
                  <div className="text-green-600 text-4xl mb-3">🌍</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Better System</h3>
                  <p className="text-sm">Creating a sustainable and honest food ecosystem</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <span className="uppercase text-green-600 text-sm font-medium tracking-widest">Simple Process</span>
          <h2 className="text-5xl font-semibold mt-3">How FarmBridge Works</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              title: "Farmers Join",
              desc: "Register, verify identity, and list fresh produce with full control over pricing.",
              emoji: "👨‍🌾"
            },
            {
              step: "02",
              title: "Consumers Shop",
              desc: "Browse local farms, see exactly where your food comes from, and order directly.",
              emoji: "🛍️"
            },
            {
              step: "03",
              title: "Direct Delivery",
              desc: "Fresh produce reaches your doorstep quickly — often next morning.",
              emoji: "🚛"
            }
          ].map((item, index) => (
            <div 
              key={index}
              className="group bg-white border border-gray-100 hover:border-green-200 transition-all duration-300 rounded-3xl p-10 hover:shadow-xl"
            >
              <div className="text-6xl mb-6 transition-transform group-hover:scale-110">{item.emoji}</div>
              <div className="text-green-600 font-mono text-sm mb-2">{item.step}</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">{item.title}</h3>
              <p className="text-gray-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* What Makes Us Different + Image */}
      <div className="bg-gray-900 text-white py-24">
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-green-400 font-medium">NOT JUST ANOTHER MARKETPLACE</span>
            <h2 className="text-5xl font-semibold leading-tight mt-4 mb-8">
              We don’t stand between farmer and consumer.<br />
              We bring them together.
            </h2>
            
            <div className="space-y-8 text-lg text-gray-300">
              <p>
                Farmers keep full control. Prices are transparent. 
                No hidden commissions or price manipulation.
              </p>
              <p>
                Consumers know exactly who grew their food and can trust its quality because 
                we verify every farmer and product.
              </p>
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden aspect-video shadow-2xl">
            <img 
              src="https://images.pexels.com/photos/31404683/pexels-photo-31404683.jpeg" 
              alt="Happy farmer with produce"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-semibold text-gray-900">Our Values</h2>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {[
            { icon: "🌱", title: "Sustainability", desc: "Supporting eco-friendly farming that protects soil and nature" },
            { icon: "⚖️", title: "Fairness", desc: "Ensuring farmers receive just compensation for their hard work" },
            { icon: "🔎", title: "Transparency", desc: "Clear pricing and full visibility from farm to table" },
            { icon: "🏡", title: "Community", desc: "Strengthening local economies and rural livelihoods" }
          ].map((value, i) => (
            <div key={i} className="text-center group">
              <div className="text-6xl mb-6 transition-transform group-hover:rotate-12">{value.icon}</div>
              <h3 className="text-2xl font-semibold mb-3 text-gray-900">{value.title}</h3>
              <p className="text-gray-600">{value.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Vision / Closing */}
      <div className="bg-green-600 text-white py-28">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-semibold mb-8">The Future of Food Starts Here</h2>
          <p className="text-2xl text-green-100 max-w-2xl mx-auto">
            A simple, honest system where farmers thrive and every family has access to 
            truly fresh, organic food.
          </p>
          <p className="mt-10 text-lg text-green-100">
            FarmBridge — Because good food should be fair for everyone.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;