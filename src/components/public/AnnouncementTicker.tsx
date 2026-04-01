'use client';

export function AnnouncementTicker() {
  return (
    <div className="w-full bg-primary py-2 overflow-hidden select-none">
      <div className="flex animate-ticker whitespace-nowrap text-white text-[10px] md:text-xs font-bold uppercase tracking-[0.2em]">
        <span className="mx-8">Free Delivery Inside Dhaka for orders above Tk 5000</span>
        <span className="mx-8">Premium Quality Footwear Guaranteed</span>
        <span className="mx-8">New Arrivals Just Dropped - Shop Now!</span>
        <span className="mx-8">Secure Cash on Delivery Available</span>
        <span className="mx-8">Free Delivery Inside Dhaka for orders above Tk 5000</span>
        <span className="mx-8">Premium Quality Footwear Guaranteed</span>
        <span className="mx-8">New Arrivals Just Dropped - Shop Now!</span>
        <span className="mx-8">Secure Cash on Delivery Available</span>
      </div>
    </div>
  );
}
