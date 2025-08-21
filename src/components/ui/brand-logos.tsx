import React from 'react';

interface BrandLogoProps {
  brand: string;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ brand, className = "w-8 h-8" }) => {
  const logos: Record<string, JSX.Element> = {
    hyundai: (
      <svg className={className} viewBox="0 0 100 100" fill="currentColor">
        <path d="M50 10 L35 25 Q35 35 50 50 Q65 35 65 25 Z M35 75 Q35 85 50 90 Q65 85 65 75 L50 50 Z" />
        <text x="50" y="95" textAnchor="middle" fontSize="8" fontWeight="bold">H</text>
      </svg>
    ),
    kia: (
      <svg className={className} viewBox="0 0 100 100" fill="currentColor">
        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="4"/>
        <text x="50" y="58" textAnchor="middle" fontSize="24" fontWeight="bold">KIA</text>
      </svg>
    ),
    genesis: (
      <svg className={className} viewBox="0 0 100 100" fill="currentColor">
        <polygon points="50,15 30,40 70,40"/>
        <polygon points="30,60 70,60 50,85"/>
        <text x="50" y="95" textAnchor="middle" fontSize="8" fontWeight="bold">G</text>
      </svg>
    ),
    kgm: (
      <svg className={className} viewBox="0 0 100 100" fill="currentColor">
        <rect x="20" y="20" width="60" height="60" rx="10" fill="none" stroke="currentColor" strokeWidth="3"/>
        <text x="50" y="58" textAnchor="middle" fontSize="16" fontWeight="bold">KGM</text>
      </svg>
    ),
    renault: (
      <svg className={className} viewBox="0 0 100 100" fill="currentColor">
        <polygon points="50,20 20,45 35,70 65,70 80,45"/>
        <text x="50" y="90" textAnchor="middle" fontSize="8" fontWeight="bold">R</text>
      </svg>
    ),
    bmw: (
      <svg className={className} viewBox="0 0 100 100" fill="currentColor">
        <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="4"/>
        <path d="M50 15 A35 35 0 0 1 85 50 L50 50 Z" fill="currentColor" opacity="0.3"/>
        <path d="M15 50 A35 35 0 0 1 50 85 L50 50 Z" fill="currentColor" opacity="0.3"/>
        <text x="50" y="95" textAnchor="middle" fontSize="8" fontWeight="bold">BMW</text>
      </svg>
    ),
    mercedes: (
      <svg className={className} viewBox="0 0 100 100" fill="currentColor">
        <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="3"/>
        <path d="M50 20 L50 50 L35 70 M50 50 L65 70" stroke="currentColor" strokeWidth="3" fill="none"/>
        <text x="50" y="95" textAnchor="middle" fontSize="6" fontWeight="bold">MB</text>
      </svg>
    ),
    audi: (
      <svg className={className} viewBox="0 0 100 100" fill="currentColor">
        <circle cx="25" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="3"/>
        <circle cx="45" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="3"/>
        <circle cx="65" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="3"/>
        <circle cx="85" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="3"/>
      </svg>
    ),
    volkswagen: (
      <svg className={className} viewBox="0 0 100 100" fill="currentColor">
        <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="3"/>
        <text x="50" y="45" textAnchor="middle" fontSize="20" fontWeight="bold">V</text>
        <text x="50" y="65" textAnchor="middle" fontSize="20" fontWeight="bold">W</text>
      </svg>
    ),
    porsche: (
      <svg className={className} viewBox="0 0 100 100" fill="currentColor">
        <rect x="20" y="30" width="60" height="40" rx="5" fill="none" stroke="currentColor" strokeWidth="3"/>
        <text x="50" y="55" textAnchor="middle" fontSize="12" fontWeight="bold">P</text>
      </svg>
    ),
    tesla: (
      <svg className={className} viewBox="0 0 100 100" fill="currentColor">
        <path d="M30 30 L70 30 L70 35 L55 35 L55 70 L45 70 L45 35 L30 35 Z"/>
        <rect x="35" y="20" width="30" height="8" rx="4"/>
      </svg>
    ),
    toyota: (
      <svg className={className} viewBox="0 0 100 100" fill="currentColor">
        <ellipse cx="50" cy="50" rx="25" ry="15" fill="none" stroke="currentColor" strokeWidth="3"/>
        <ellipse cx="50" cy="50" rx="15" ry="25" fill="none" stroke="currentColor" strokeWidth="3"/>
        <circle cx="50" cy="50" r="8"/>
      </svg>
    ),
    honda: (
      <svg className={className} viewBox="0 0 100 100" fill="currentColor">
        <path d="M25 25 L25 75 M25 50 L75 50 M75 25 L75 75" stroke="currentColor" strokeWidth="5" fill="none"/>
        <text x="50" y="95" textAnchor="middle" fontSize="8" fontWeight="bold">H</text>
      </svg>
    ),
    nissan: (
      <svg className={className} viewBox="0 0 100 100" fill="currentColor">
        <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="3"/>
        <text x="50" y="58" textAnchor="middle" fontSize="16" fontWeight="bold">N</text>
      </svg>
    ),
    mazda: (
      <svg className={className} viewBox="0 0 100 100" fill="currentColor">
        <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="3"/>
        <path d="M30 50 Q50 30 70 50 Q50 70 30 50" fill="currentColor"/>
      </svg>
    ),
    lexus: (
      <svg className={className} viewBox="0 0 100 100" fill="currentColor">
        <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="3"/>
        <text x="50" y="58" textAnchor="middle" fontSize="18" fontWeight="bold">L</text>
      </svg>
    ),
    infiniti: (
      <svg className={className} viewBox="0 0 100 100" fill="currentColor">
        <path d="M30 30 L50 70 L70 30" fill="none" stroke="currentColor" strokeWidth="4"/>
        <path d="M40 30 L50 50 L60 30" fill="none" stroke="currentColor" strokeWidth="3"/>
      </svg>
    ),
    ford: (
      <svg className={className} viewBox="0 0 100 100" fill="currentColor">
        <ellipse cx="50" cy="50" rx="35" ry="25" fill="none" stroke="currentColor" strokeWidth="3"/>
        <text x="50" y="58" textAnchor="middle" fontSize="16" fontWeight="bold">F</text>
      </svg>
    ),
    chevrolet: (
      <svg className={className} viewBox="0 0 100 100" fill="currentColor">
        <path d="M20 40 L50 20 L80 40 L80 60 L50 80 L20 60 Z" fill="none" stroke="currentColor" strokeWidth="3"/>
        <path d="M30 50 L50 30 L70 50" fill="none" stroke="currentColor" strokeWidth="3"/>
      </svg>
    ),
    cadillac: (
      <svg className={className} viewBox="0 0 100 100" fill="currentColor">
        <rect x="20" y="30" width="60" height="40" rx="5" fill="none" stroke="currentColor" strokeWidth="3"/>
        <path d="M30 40 L40 50 L30 60 M70 40 L60 50 L70 60" stroke="currentColor" strokeWidth="2" fill="none"/>
      </svg>
    ),
    lincoln: (
      <svg className={className} viewBox="0 0 100 100" fill="currentColor">
        <rect x="25" y="25" width="50" height="50" rx="5" fill="none" stroke="currentColor" strokeWidth="3"/>
        <path d="M35 35 L65 65 M35 65 L65 35" stroke="currentColor" strokeWidth="3"/>
      </svg>
    ),
    volvo: (
      <svg className={className} viewBox="0 0 100 100" fill="currentColor">
        <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="3"/>
        <path d="M30 30 L70 70 M70 30 L30 70" stroke="currentColor" strokeWidth="3"/>
        <circle cx="50" cy="50" r="8"/>
      </svg>
    ),
    jaguar: (
      <svg className={className} viewBox="0 0 100 100" fill="currentColor">
        <path d="M20 50 Q30 30 50 40 Q70 30 80 50 Q70 70 50 60 Q30 70 20 50" fill="currentColor"/>
        <circle cx="40" cy="45" r="3" fill="white"/>
      </svg>
    ),
    landrover: (
      <svg className={className} viewBox="0 0 100 100" fill="currentColor">
        <rect x="20" y="35" width="60" height="30" rx="15" fill="none" stroke="currentColor" strokeWidth="3"/>
        <text x="50" y="55" textAnchor="middle" fontSize="12" fontWeight="bold">LR</text>
      </svg>
    ),
    mini: (
      <svg className={className} viewBox="0 0 100 100" fill="currentColor">
        <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="4"/>
        <circle cx="50" cy="45" r="20" fill="none" stroke="currentColor" strokeWidth="3"/>
        <rect x="40" y="60" width="20" height="8" rx="4"/>
      </svg>
    ),
    peugeot: (
      <svg className={className} viewBox="0 0 100 100" fill="currentColor">
        <path d="M30 30 Q50 20 70 30 L70 50 Q50 40 30 50 Z" fill="currentColor"/>
        <path d="M30 50 Q50 60 70 50 L70 70 Q50 80 30 70 Z" fill="currentColor" opacity="0.7"/>
      </svg>
    ),
    citroen: (
      <svg className={className} viewBox="0 0 100 100" fill="currentColor">
        <path d="M25 60 Q35 40 50 50 Q65 40 75 60" fill="none" stroke="currentColor" strokeWidth="4"/>
        <path d="M25 50 Q35 30 50 40 Q65 30 75 50" fill="none" stroke="currentColor" strokeWidth="4"/>
      </svg>
    )
  };

  return logos[brand] || (
    <svg className={className} viewBox="0 0 100 100" fill="currentColor">
      <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="3"/>
      <text x="50" y="58" textAnchor="middle" fontSize="16" fontWeight="bold">
        {brand.charAt(0).toUpperCase()}
      </text>
    </svg>
  );
};