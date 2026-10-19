import { Helmet } from 'react-helmet-async';
import { APP_NAME } from '../../utils/constants';

const SEO = ({ title, description, path = '', image, type = 'website', keywords }) => {
  const fullTitle = title ? `${title} | ${APP_NAME}` : `${APP_NAME} - Premier Athletic Gear & Sports Store`;
  const fullDescription = description || 'Shop premium sports equipment at MLA Sports, Mirgund, Budgam, J&K. Cricket, football, volleyball, badminton, gym & running accessories.';
  const url = `https://mlasports.vercel.app${path}`;
  const metaImage = image || 'https://mlasports.vercel.app/og-image.jpg';

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={url} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={metaImage} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={metaImage} />
    </Helmet>
  );
};

export default SEO;
