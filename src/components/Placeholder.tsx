import React from 'react';
import { Compass } from 'lucide-react';
import { Card, CardContent } from './ui/Card';

export function Placeholder({ title = "Coming Soon" }: { title?: string }) {
  return (
    <div className="flex items-center justify-center h-full min-h-[400px] w-full p-8">
      <Card glass className="w-full max-w-md border-white/10 text-center">
        <CardContent className="pt-8 space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-brand-navy border border-white/10 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(37,99,235,0.3)]">
            <Compass className="h-8 w-8 text-brand-cyan animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <p className="text-slate-400">
            We are working hard to bring you this feature. Check back later!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
