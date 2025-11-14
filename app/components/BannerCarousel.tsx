'use client';

import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { banners, type Banner } from '../data/banners';

interface BannerCarouselProps {
  banners?: Banner[];
}

export default function BannerCarousel({ banners: customBanners }: BannerCarouselProps) {
  const displayBanners = customBanners || banners;
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 20 });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    // Auto-play
    const autoplay = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000);

    return () => {
      emblaApi.off('select', onSelect);
      clearInterval(autoplay);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className="relative w-full overflow-hidden py-4">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="overflow-hidden rounded-lg" ref={emblaRef}>
          <div className="flex">
            {displayBanners.map((banner) => (
              <div
                key={banner.id}
                className="relative min-w-0 w-full flex-shrink-0"
              >
                {banner.link ? (
                  <Link href={banner.link} className="block">
                    <div
                      className="relative h-[300px] md:h-[400px] lg:h-[450px] bg-cover bg-center bg-no-repeat rounded-lg"
                      style={{
                        backgroundImage: `url(${banner.image})`,
                      }}
                    />
                  </Link>
                ) : (
                  <div
                    className="relative h-[300px] md:h-[400px] lg:h-[450px] bg-cover bg-center bg-no-repeat rounded-lg"
                    style={{
                      backgroundImage: `url(${banner.image})`,
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dot Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              index === selectedIndex
                ? 'w-8 bg-primary'
                : 'w-2 bg-white/50 hover:bg-white/75'
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

