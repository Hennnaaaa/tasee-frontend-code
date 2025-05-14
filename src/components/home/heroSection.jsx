import { Button } from '@/components/ui/button';

const HeroSection = () => {
  return (
    <section className="relative">
      <div className="aspect-[16/9] lg:aspect-[21/9] relative bg-pink-50">
        <img 
          src="/api/placeholder/1920/800" 
          alt="Hero" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-4xl lg:text-6xl font-serif mb-4">New Summer Collection</h2>
            <p className="text-xl mb-8">Discover the latest trends in women's fashion</p>
            <Button size="lg" className="bg-white text-black hover:bg-gray-100">
              Shop Now
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;