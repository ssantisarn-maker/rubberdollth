
import { translations } from './src/data/translations.js';
import { products } from './src/data/products.js';
import { siteConfig } from './src/data/siteConfig.js';
import { reviews } from './src/data/reviews.js';

console.log('Translations TH keys:', Object.keys(translations.th));
console.log('Translations EN keys:', Object.keys(translations.en));
console.log('Total products:', products.length);
console.log('SiteConfig:', siteConfig.siteName);
console.log('Reviews count:', reviews.length);
