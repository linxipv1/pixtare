import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  schema?: object;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'Pixtrate - Mobilya, Aksesuar ve Takı için AI Görsel Üretimi',
  description = 'Türkiye\'nin en gelişmiş AI tabanlı görsel ve video üretim platformu. Mobilya, aksesuar ve takı ürünlerinizi profesyonel görsellere dönüştürün.',
  keywords = 'ai görsel üretimi, mobilya fotoğrafları, aksesuar çekimi, takı fotoğrafları, e-ticaret görselleri, ürün fotoğrafçılığı, ai video üretimi',
  image = '/og-image.jpg',
  url = window.location.href,
  type = 'website',
  schema,
}) => {
  const siteName = 'Pixtrate';
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Pixtrate" />
      <link rel="canonical" href={url} />

      {/* Open Graph Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="tr_TR" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="Turkish" />
      <meta name="geo.region" content="TR" />
      <meta name="geo.placename" content="Turkey" />

      {/* Structured Data */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Pixtrate",
  "url": "https://pixtrate.com",
  "description": "Mobilya, aksesuar ve takı satıcıları için AI tabanlı görsel ve video üretim platformu",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "TR",
    "addressLocality": "İstanbul"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+90-212-123-4567",
    "contactType": "customer service",
    "availableLanguage": "Turkish"
  },
  "sameAs": [
    "https://linkedin.com/company/aivisualstudio",
    "https://instagram.com/aivisualstudio"
  ]
};

export const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Pixtrate",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "description": "AI tabanlı görsel ve video üretim platformu",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "TRY",
    "description": "Ücretsiz deneme paketi mevcut"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "150"
  }
};