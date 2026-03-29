
export function AnnouncementTicker() {
  const announcements = [
    "Cash on Delivery Nationwide",
    "Premium Quality Guaranteed",
    "Easy Returns within 7 Days",
    "New Arrivals Every Week",
    "Shop the Latest Trends at Divine.Co"
  ];

  return (
    <div className="bg-primary text-primary-foreground overflow-hidden py-1.5 text-xs font-medium">
      <div className="animate-ticker flex gap-20 items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-20">
            {announcements.map((text, idx) => (
              <span key={idx} className="uppercase tracking-widest">{text}</span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
