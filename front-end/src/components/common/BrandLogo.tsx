import logoSrc from '../../assets/Logo.svg'

type BrandLogoProps = {
  className?: string
  alt?: string
}

export default function BrandLogo({ className, alt = 'Eventure' }: BrandLogoProps) {
  return <img src={logoSrc} alt={alt} className={className} />
}
