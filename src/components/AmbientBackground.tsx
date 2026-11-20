export function AmbientBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#FAFAFF]"
      aria-hidden="true"
    >
      {/* Orange-gold warm glow orb (top-left) */}
      <div
        className="orb-float-a absolute -top-24 -left-24 h-[340px] w-[340px] rounded-full opacity-35 blur-[90px] md:h-[460px] md:w-[460px]"
        style={{
          background: 'radial-gradient(circle, #FFB800 0%, #FF6B00 60%, transparent 100%)',
        }}
      />

      {/* Violet-pink soft glow orb (top-right / mid-right) */}
      <div
        className="orb-float-b absolute top-1/4 -right-28 h-[360px] w-[360px] rounded-full opacity-28 blur-[100px] md:h-[500px] md:w-[500px]"
        style={{
          background: 'radial-gradient(circle, #EC4899 0%, #7C3AED 58%, transparent 100%)',
        }}
      />

      {/* Electric cyan glow orb (bottom-left) */}
      <div
        className="orb-float-c absolute -bottom-28 left-1/4 h-[320px] w-[320px] rounded-full opacity-25 blur-[95px] md:h-[440px] md:w-[440px]"
        style={{
          background: 'radial-gradient(circle, #06B6D4 0%, #38BDF8 60%, transparent 100%)',
        }}
      />
    </div>
  );
}
