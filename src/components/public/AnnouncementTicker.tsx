'use client';

export function AnnouncementTicker() {
  return (
    <div className="bg-primary text-white py-2 overflow-hidden relative h-10 flex items-center">
      <div className="animate-ticker whitespace-nowrap absolute">
        <span className="mx-10 uppercase tracking-widest text-[10px] font-bold">✨ Free Delivery Inside Dhaka on Orders Over Tk 2000 ✨</span>
        <span className="mx-10 uppercase tracking-widest text-[10px] font-bold">✨ New Arrivals: Premium Silk Collection Now Live ✨</span>
        <span className="mx-10 uppercase tracking-widest text-[10px] font-bold">✨ 10% Discount for First-Time Shoppers ✨</span>
        <span className="mx-10 uppercase tracking-widest text-[10px] font-bold">✨ Free Delivery Inside Dhaka on Orders Over Tk 2000 ✨</span>
        <span className="mx-10 uppercase tracking-widest text-[10px] font-bold">✨ New Arrivals: Premium Silk Collection Now Live ✨</span>
      </div>
    </div>
  );
}
