'use client';

export default function CouponSelected({
  target,
  selectedTarget,
  setSelectedTarget,
}) {
  const isActive = selectedTarget === target;

  return (
    <button
      className={`font-tw leading-p-tw hover:underline decoration-red decoration-2 underline-offset-4 cursor-pointer ${
        isActive ? 'underline' : ''
      }`}
      onClick={() => setSelectedTarget(target)}
    >
      {target}
    </button>
  );
}
