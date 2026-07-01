import { siteConfig } from '@/lib/seo/config';

interface BrandLogoProps {
  className?: string;
  accentClassName?: string;
}

/** Wordmark: Faven + accent "to" */
export default function BrandLogo({
  className = '',
  accentClassName = 'text-brand-accent',
}: BrandLogoProps) {
  const name = siteConfig.name;
  const accentStart = Math.max(0, name.length - 2);

  return (
    <span className={className}>
      {name.slice(0, accentStart)}
      <span className={accentClassName}>{name.slice(accentStart)}</span>
    </span>
  );
}
