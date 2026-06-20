import React from 'react';
import { motion } from 'motion/react';

interface SectionSkeletonProps {
  section: string;
}

export const SectionSkeleton: React.FC<SectionSkeletonProps> = ({ section }) => {
  // Select variations based on the type of page to make it extremely tailored
  const renderSkeletonContent = () => {
    switch (section) {
      case 'home':
        return (
          <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center flex-grow w-full">
            {/* Left side: Hero Text Skeleton */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="h-4 w-32 bg-slate-200/60 dark:bg-slate-800/60 rounded animate-pulse" />
              <div className="space-y-3">
                <div className="h-10 sm:h-12 w-3/4 bg-slate-200/80 dark:bg-slate-800/80 rounded-lg animate-pulse" />
                <div className="h-10 sm:h-12 w-1/2 bg-slate-200/80 dark:bg-slate-800/80 rounded-lg animate-pulse" />
              </div>
              <div className="space-y-2 pt-4">
                <div className="h-4 w-full bg-slate-200/60 dark:bg-slate-800/60 rounded animate-pulse" />
                <div className="h-4 w-11/12 bg-slate-200/60 dark:bg-slate-800/60 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-slate-200/60 dark:bg-slate-800/60 rounded animate-pulse" />
              </div>
              <div className="flex flex-wrap gap-4 pt-6">
                <div className="h-12 w-36 bg-slate-200/80 dark:bg-slate-800/80 rounded-xl animate-pulse" />
                <div className="h-12 w-36 bg-slate-200/80 dark:bg-slate-800/80 rounded-xl animate-pulse" />
              </div>
            </div>

            {/* Right side: Large Img / Circle Avatar Skeleton */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-56 h-56 sm:w-64 sm:h-64 lg:w-80 lg:h-80 select-none">
                <div className="absolute inset-0 bg-slate-200/40 dark:bg-slate-800/40 rounded-full blur-2xl animate-pulse" />
                <div className="w-full h-full rounded-full bg-slate-200/70 dark:bg-slate-800/70 animate-pulse border-4 border-slate-100/30 dark:border-slate-800/30" />
              </div>
            </div>
          </div>
        );

      case 'skills':
      case 'pipeline':
      case 'ml-playground':
      case 'terminal':
        // Bento / Dashboard Grid variation
        return (
          <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 w-full">
            {/* Header section skeleton */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <div className="h-4 w-24 bg-slate-200/60 dark:bg-slate-800/60 rounded mx-auto animate-pulse" />
              <div className="h-8 w-64 bg-slate-200/80 dark:bg-slate-800/80 rounded-lg mx-auto animate-pulse" />
              <div className="h-3 w-5/6 bg-slate-200/40 dark:bg-slate-800/40 rounded mx-auto animate-pulse" />
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left bento panel */}
              <div className="md:col-span-1 bg-white/40 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-800/45 rounded-2xl p-6 space-y-6">
                <div className="h-5 w-1/2 bg-slate-200/70 dark:bg-slate-800/70 rounded animate-pulse" />
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-200/60 dark:bg-slate-800/60 animate-pulse" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 w-2/3 bg-slate-200/80 dark:bg-slate-800/80 rounded animate-pulse" />
                        <div className="h-2 w-1/2 bg-slate-200/50 dark:bg-slate-800/50 rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Center & right main visual bento panels */}
              <div className="md:col-span-2 space-y-6">
                <div className="bg-white/40 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-800/45 rounded-2xl p-6 h-64 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="h-5 w-40 bg-slate-200/70 dark:bg-slate-800/70 rounded animate-pulse" />
                      <div className="h-3 w-64 bg-slate-200/40 dark:bg-slate-800/40 rounded animate-pulse" />
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-200/60 dark:bg-slate-800/60 animate-pulse" />
                  </div>
                  {/* Mimic a charting area */}
                  <div className="h-32 w-full flex items-end gap-3 pt-4">
                    {[35, 60, 45, 90, 75, 50, 85, 40].map((height, i) => (
                      <div
                        key={i}
                        className="flex-grow bg-slate-200/55 dark:bg-slate-800/55 rounded-t-lg animate-pulse"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-white/40 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-800/45 rounded-xl p-5 space-y-3">
                      <div className="h-4 w-1/3 bg-slate-200/70 dark:bg-slate-800/70 rounded animate-pulse" />
                      <div className="h-3 w-5/6 bg-slate-200/40 dark:bg-slate-800/40 rounded animate-pulse" />
                      <div className="h-2 w-2/3 bg-slate-200/40 dark:bg-slate-800/40 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'about':
      case 'services':
      case 'certifications':
      case 'blog':
      case 'experience':
        // Editorial/Article/Listing variation
        return (
          <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-10 w-full">
            {/* Centered high-level card block skeleton */}
            <div className="text-center space-y-4 max-w-xl mx-auto">
              <div className="h-4 w-28 bg-slate-200/60 dark:bg-slate-800/60 rounded mx-auto animate-pulse" />
              <div className="h-8 w-72 bg-slate-200/80 dark:bg-slate-800/80 rounded-lg mx-auto animate-pulse" />
            </div>

            <div className="bg-white/40 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-800/45 rounded-2xl p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-slate-200/70 dark:bg-slate-800/70 animate-pulse shrink-0" />
                <div className="space-y-2 flex-grow">
                  <div className="h-4 w-1/4 bg-slate-200/75 dark:bg-slate-800/75 rounded animate-pulse" />
                  <div className="h-3 w-1/3 bg-slate-200/40 dark:bg-slate-800/40 rounded animate-pulse" />
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-200/30 dark:border-slate-800/20">
                <div className="h-4 w-full bg-slate-200/60 dark:bg-slate-800/60 rounded animate-pulse" />
                <div className="h-4 w-11/12 bg-slate-200/60 dark:bg-slate-800/60 rounded animate-pulse" />
                <div className="h-4 w-full bg-slate-200/60 dark:bg-slate-800/60 rounded animate-pulse" />
                <div className="h-4 w-9/12 bg-slate-200/60 dark:bg-slate-800/60 rounded animate-pulse" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/30 dark:border-slate-800/20">
                    <div className="w-10 h-10 rounded-lg bg-slate-200/60 dark:bg-slate-800/60 animate-pulse shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3 w-1/2 bg-slate-200/75 dark:bg-slate-800/75 rounded animate-pulse" />
                      <div className="h-2 w-full bg-slate-200/40 dark:bg-slate-800/40 rounded animate-pulse" />
                      <div className="h-2 w-4/5 bg-slate-200/40 dark:bg-slate-800/40 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        // Generic grid/cards list loading skeleton
        return (
          <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 w-full">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="h-8 w-56 bg-slate-200/80 dark:bg-slate-800/80 rounded-lg mx-auto animate-pulse" />
              <div className="h-3 w-4/5 bg-slate-200/40 dark:bg-slate-800/40 rounded mx-auto animate-pulse" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <div key={idx} className="bg-white/40 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-800/45 rounded-xl p-5 space-y-4 shadow-sm">
                  <div className="w-full h-36 bg-slate-200/50 dark:bg-slate-800/50 rounded-lg animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 w-2/3 bg-slate-200/75 dark:bg-slate-800/75 rounded animate-pulse" />
                    <div className="h-2.5 w-full bg-slate-200/40 dark:bg-slate-800/40 rounded animate-pulse" />
                    <div className="h-2.5 w-5/6 bg-slate-200/40 dark:bg-slate-800/40 rounded animate-pulse" />
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <div className="h-3 w-16 bg-slate-200/50 dark:bg-slate-800/50 rounded animate-pulse" />
                    <div className="h-7 w-20 bg-slate-200/70 dark:bg-slate-800/70 rounded-md animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex-grow flex flex-col justify-center items-center select-none w-full py-10">
      {renderSkeletonContent()}
    </div>
  );
};
