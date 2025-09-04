import React from 'react';

export function getPasswordScore(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(score, 5);
}

export default function PasswordStrength({ password }: { password: string }) {
  const score = getPasswordScore(password);
  const colors = ['bg-gray-200', 'bg-red-400', 'bg-yellow-400', 'bg-amber-500', 'bg-green-500', 'bg-emerald-600'];
  const labels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong', 'Strong'];
  return (
    <div className="mt-2" aria-live="polite">
      <div className="flex gap-1">
        {[0,1,2,3,4].map((i) => (
          <div key={i} className={`h-1.5 flex-1 rounded ${i < score ? colors[score] : 'bg-gray-200'}`} />
        ))}
      </div>
      <div className="mt-1 text-xs text-gray-500">{labels[score]}</div>
    </div>
  );
}


