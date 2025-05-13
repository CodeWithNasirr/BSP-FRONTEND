import { SitemapStream, streamToPromise } from 'sitemap';
import { createWriteStream } from 'fs';

const sitemap = new SitemapStream({ hostname: 'https://whatsappgptx.com/' });

const writeStream = createWriteStream('./public/sitemap.xml');

sitemap.pipe(writeStream);

[
  '/',
  '/login',
  '/register',
  '/dashboard',
  '/templates',
  '/templates/create',
  '/campaigns/create',
  '/campaigns/:id',
  '/contacts',
  '/bulk-upload',
  '/connect-form',
  '/whatsapp-setting',
  '/Acer-laptop-service',
  '/Assus-laptop-service',
  '/chats',
  '/chats/:id',
  '/subscriptions',
  '/my-usage-panel',
  '/chat-flow',
].forEach(url => sitemap.write({ url }));

sitemap.end();

streamToPromise(sitemap).then(sm => console.log('✅ Sitemap created!'));
