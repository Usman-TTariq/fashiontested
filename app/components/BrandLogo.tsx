import { siteConfig } from '@/lib/seo/config';

interface BrandLogoProps {
  className?: string;
  accentClassName?: string;
}

/** Wordmark: Fashion + accent "Tested" */
export default function BrandLogo({
  className = '',
  accentClassName = 'text-brand-accent',
}: BrandLogoProps) {
  return (
    <span className={className}>
      {siteConfig.logoPrimary}
      <span className={accentClassName}>{siteConfig.logoAccent}</span>
    </span>
  );
}
