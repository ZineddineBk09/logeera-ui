import { cn } from '@/lib/utils';
import Image from 'next/image';

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <div
      className={cn(
        'flex h-[52px] w-[52px] items-center justify-center',
        className,
      )}
    >
      <Image
        src="/images/logo.png"
        alt="Logo"
        width={52}
        height={52}
        className={cn('h-full w-full object-contain', className)}
      />
    </div>
  );
}
