const fs = require('fs');
const path = require('path');

const root = __dirname;
const out = path.join(root, 'dist');
const read = (file) => fs.readFileSync(file, 'utf8');
const esc = (value = '') => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const slugify = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

function parseArticle(file, locale) {
  const raw = read(file);
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  const meta = { images: [] };
  if (!match) return { slug: path.basename(file, '.md'), locale, ...meta, body: raw };
  let readingImages = false;
  for (const line of match[1].split('\n')) {
    if (/^images:\s*$/.test(line)) { readingImages = true; continue; }
    const pair = line.match(/^([\w-]+):\s*["']?(.*?)["']?\s*$/);
    if (pair && !line.startsWith(' ') && !line.startsWith('-')) {
      readingImages = false;
      meta[pair[1]] = pair[2];
      continue;
    }
    if (readingImages) {
      const image = line.match(/^\s*-\s*(?:image:\s*)?["']?(.*?)["']?\s*$/);
      if (image && image[1]) meta.images.push(image[1]);
    }
  }
  return { slug: path.basename(file, '.md'), locale, ...meta, body: match[2].trim() };
}

function markdown(source) {
  return source.split(/\n\s*\n/).filter(Boolean).map((paragraph) => {
    if (paragraph.startsWith('## ')) return `<h2>${esc(paragraph.slice(3))}</h2>`;
    const safe = esc(paragraph)
      .replace(/\[([^\]]+)\]\(([^\s)]+)\)/g, '<a href="$2">$1</a>')
      .replace(/  \n/g, '<br>');
    return `<p>${safe}</p>`;
  }).join('\n');
}

function unquote(value = '') {
  return value.trim().replace(/^['"]|['"]$/g, '');
}

function readHomeSettings() {
  const settings = { announcements: [], images: [] };
  const file = path.join(root, 'content', 'settings', 'home.yml');
  if (!fs.existsSync(file)) return settings;
  let section = '';
  let announcement = null;
  for (const line of read(file).split('\n')) {
    const trimmedLine = line.trim();
    if (trimmedLine === 'announcements:') { section = 'announcements'; continue; }
    if (trimmedLine === 'images:') { section = 'images'; continue; }
    const text = line.match(/^\s*-\s*text:\s*(.*)$/);
    const url = line.match(/^\s+url:\s*(.*)$/);
    const image = line.match(/^\s*-\s*(.+)$/);
    if (section === 'announcements' && text) {
      announcement = { text: unquote(text[1]), url: '' };
      settings.announcements.push(announcement);
    } else if (section === 'announcements' && url && announcement) {
      announcement.url = unquote(url[1]);
    } else if (section === 'images' && image) {
      settings.images.push(unquote(image[1]));
    }
  }
  return settings;
}

function readPortfolioSetting() {
  const file = path.join(root, 'content', 'settings', 'portfolio.yml');
  if (!fs.existsSync(file)) return '/portfolio.pdf';
  const match = read(file).match(/^portfolio:\s*(.*)$/m);
  return match ? unquote(match[1]) : '/portfolio.pdf';
}

function nav(locale, current = '') {
  const home = locale === 'fr' ? '/' : '/en/';
  const projects = locale === 'fr' ? '/projets/' : '/projects/';
  const bio = locale === 'fr' ? '/bio/' : '/en/bio/';
  const contact = locale === 'fr' ? '/contact/' : '/en/contact/';
  const labels = locale === 'fr' ? ['Io Burgard', 'bio', 'projets', 'contact'] : ['Io Burgard', 'bio', 'projects', 'contact'];
  const links = [home, bio, projects, contact];
  const language = locale === 'fr' ? (current ? `/en/projects/${current}/` : '/en/') : (current ? `/projets/${current}/` : '/');
  return `<header class="site-header"><nav class="main-nav">${links.map((link, i) => `<a href="${link}">${labels[i]}</a>`).join('')}</nav><nav class="language"><a href="${locale === 'fr' ? (current ? `/projets/${current}/` : '/') : language}">FR</a><span class="separator">/</span><a href="${locale === 'en' ? (current ? `/en/projects/${current}/` : '/en/') : language}">EN</a></nav></header>`;
}

function layout({ locale, title, current, content }) {
  return `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(title)} — Io Burgard</title><link rel="stylesheet" href="/style.css"></head><body>${nav(locale, current)}${content}</body></html>`;
}

function write(relative, content) {
  const destination = path.join(out, relative, relative.endsWith('.html') ? '' : 'index.html');
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, content);
}

function projectCard(article, locale) {
  const base = locale === 'fr' ? '/projets/' : '/en/projects/';
  return `<a href="${base}${article.slug}/">${esc(article.title)}</a>`;
}

function articlePage(article, articles, locale) {
  const index = articles.findIndex((item) => item.slug === article.slug);
  const previous = articles[index - 1];
  const next = articles[index + 1];
  const other = locale === 'fr' ? 'en' : 'fr';
  const hasTranslation = articlesByLocale[other].some((item) => item.slug === article.slug);
  const images = article.images.map((image) => `<img src="${esc(image)}" alt="${esc(article.title)}">`).join('');
  const pagination = [previous, next].filter(Boolean).map((item) => `<a href="../${item.slug}/">${esc(item.title)}</a>`).join('');
  const languageCurrent = hasTranslation ? article.slug : '';
  const header = nav(locale, languageCurrent);
  return `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(article.title)} — Io Burgard</title><link rel="stylesheet" href="/style.css"></head><body>${header}<main class="article"><h1>${esc(article.title)}</h1>${markdown(article.body)}<section class="article-images">${images}</section><nav class="article-pagination">${pagination}</nav></main></body></html>`;
}

const articlesByLocale = { fr: [], en: [] };
const homeSettings = readHomeSettings();
const portfolioSetting = readPortfolioSetting();
for (const locale of ['fr', 'en']) {
  const folder = path.join(root, 'content', 'projects', locale);
  if (fs.existsSync(folder)) articlesByLocale[locale] = fs.readdirSync(folder).filter((file) => file.endsWith('.md')).map((file) => parseArticle(path.join(folder, file), locale)).sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
fs.cpSync(path.join(root, 'assets'), path.join(out, 'assets'), { recursive: true });
if (fs.existsSync(path.join(root, 'public'))) {
  fs.cpSync(path.join(root, 'public'), out, { recursive: true });
}
fs.cpSync(path.join(root, 'admin'), path.join(out, 'admin'), { recursive: true });
fs.copyFileSync(path.join(root, "..", "config.json"), path.join(out, "config.json"));
const selectedPortfolio = path.join(root, 'public', portfolioSetting.replace(/^\/+/, ''));
const portfolioSource = fs.existsSync(selectedPortfolio) ? selectedPortfolio : path.join(root, 'portfolio.pdf');
fs.copyFileSync(portfolioSource, path.join(out, 'portfolio.pdf'));
fs.copyFileSync(path.join(root, 'style.css'), path.join(out, 'style.css'));

for (const locale of ['fr', 'en']) {
  const isFr = locale === 'fr';
  const projectsPath = isFr ? 'projets' : 'en/projects';
  const projectsLabel = isFr ? 'Projets' : 'Projects';
  const homeImages = `<section class="home-images">${homeSettings.images.map((image) => `<img src="${esc(image)}" alt="Io Burgard">`).join('')}</section>`;
  const news = `<section class="news">${homeSettings.announcements.map((item) => item.url ? `<a href="${esc(item.url)}" target="_blank" rel="noopener">${esc(item.text)}</a>` : `<span>${esc(item.text)}</span>`).join('')}</section>`;
  write(isFr ? '' : 'en', layout({ locale, title: 'Io Burgard', content: `<main class="home-content">${news}${homeImages}</main>` }));
  write(projectsPath, layout({ locale, title: projectsLabel, content: `<main class="project-list">${articlesByLocale[locale].map((article) => projectCard(article, locale)).join('')}</main>` }));
  for (const article of articlesByLocale[locale]) write(`${projectsPath}/${article.slug}`, articlePage(article, articlesByLocale[locale], locale));
}

const bioFr = read(path.join(root, 'content', 'settings', 'bio.fr.md'));
const bioEn = read(path.join(root, 'content', 'settings', 'bio.en.md'));
for (const [locale, text] of [['fr', bioFr], ['en', bioEn]]) {
  const isFr = locale === 'fr';
  const bioContent = `<main class="text-page bio">${markdown(text)}${isFr ? '<p><a href="/portfolio.pdf" download>télécharger le portefolio</a></p>' : '<p><a href="/portfolio.pdf" download>download portfolio</a></p>'}</main>`;
  const contactContent = `<main class="text-page"><form class="contact-form" action="mailto:ioburgard@gmail.com" method="post" enctype="text/plain"><label>${isFr ? 'Votre nom' : 'Your name'}<input name="name" autocomplete="name" required></label><label>${isFr ? 'Votre e-mail' : 'Your email'}<input type="email" name="email" autocomplete="email" required></label><label>${isFr ? 'Objet' : 'Subject'}<input name="subject" required></label><label>${isFr ? 'Votre message (facultatif)' : 'Your message (optional)'}<textarea name="message"></textarea></label><button type="submit">${isFr ? 'Envoyer' : 'Send'}</button></form></main>`;
  write(isFr ? 'bio' : 'en/bio', layout({ locale, title: 'Bio', content: bioContent }));
  write(isFr ? 'contact' : 'en/contact', layout({ locale, title: 'Contact', content: contactContent }));
}

console.log(`Built ${articlesByLocale.fr.length} French and ${articlesByLocale.en.length} English projects.`);
