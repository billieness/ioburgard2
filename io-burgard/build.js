const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const yaml = require('js-yaml');

const root = __dirname;
const out = path.join(root, '..', 'docs'); // Génère directement dans /docs

// Nettoyer et recréer le dossier de sortie
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

// Copier les fichiers statiques
fs.cpSync(path.join(root, 'assets'), path.join(out, 'assets'), { recursive: true });
fs.cpSync(path.join(root, 'admin'), path.join(out, 'admin'), { recursive: true });
fs.copyFileSync(path.join(root, 'admin', 'config.yml'), path.join(out, 'admin', 'config.yml'));
fs.copyFileSync(path.join(root, 'style.css'), path.join(out, 'style.css'));
fs.copyFileSync(path.join(root, 'portfolio.pdf'), path.join(out, 'portfolio.pdf'));

// Fonction pour corriger les chemins des images (enlever le / initial)
function fixImagePaths(htmlContent) {
  return htmlContent.replace(/src="\/assets\//g, 'src="assets/')
                    .replace(/src="\/io-burgard\/assets\//g, 'src="assets/');
}

// Fonction pour générer une page projet
function generateProjectPage(projectPath, locale) {
  const content = fs.readFileSync(projectPath, 'utf8');
  const match = content.match(/^---\n(.*?)\n---\n(.*)/s);
  
  if (!match) {
    console.error(`Erreur: format invalide pour ${projectPath}`);
    return;
  }
  
  const frontmatter = yaml.load(match[1]);
  let markdownContent = match[2];
  
  // Corriger les chemins des images dans le markdown
  markdownContent = markdownContent.replace(/\/assets\//g, 'assets/');
  
  const htmlContent = marked.parse(markdownContent);
  const fixedHtmlContent = fixImagePaths(htmlContent);
  
  // Générer le nom de fichier HTML
  const projectName = path.basename(projectPath, '.md');
  const htmlFileName = locale === 'en' ? `${projectName}-en.html` : `${projectName}.html`;
  
  // Créer le template HTML
  const html = `<!doctype html>
<html lang="${locale}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${frontmatter.title} - Io Burgard</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header class="site-header">
    <nav class="main-nav" aria-label="Navigation principale">
      <a href="index.html">Io Burgard</a>
      <a href="bio${locale === 'en' ? '-en' : ''}.html">${locale === 'en' ? 'bio' : 'bio'}</a>
      <a href="projets${locale === 'en' ? '-en' : ''}.html">${locale === 'en' ? 'projects' : 'projets'}</a>
      <a href="contact${locale === 'en' ? '-en' : ''}.html">${locale === 'en' ? 'contact' : 'contact'}</a>
    </nav>
    <nav class="language" aria-label="Langue">
      <a ${locale === 'fr' ? 'class="active"' : ''} href="${projectName}.html">français</a>
      <a ${locale === 'en' ? 'class="active"' : ''} href="${projectName}-en.html">english</a>
    </nav>
  </header>
  <main class="project-content">
    <h1>${frontmatter.title}</h1>
    ${frontmatter.date ? `<p class="project-date">${new Date(frontmatter.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>` : ''}
    ${frontmatter.images ? frontmatter.images.map(img => `<img src="${img.replace(/^\//, '')}" alt="${frontmatter.title}">`).join('\n') : ''}
    ${fixedHtmlContent}
    <p><a href="projets${locale === 'en' ? '-en' : ''}.html">← Retour aux projets</a></p>
  </main>
</body>
</html>`;
  
  fs.writeFileSync(path.join(out, htmlFileName), html);
  console.log(`Généré: ${htmlFileName}`);
}

// Générer les pages de projets
const projectsDir = path.join(root, 'content', 'projects');
if (fs.existsSync(projectsDir)) {
  const locales = fs.readdirSync(projectsDir);
  
  locales.forEach(locale => {
    const localeDir = path.join(projectsDir, locale);
    if (fs.statSync(localeDir).isDirectory()) {
      const projects = fs.readdirSync(localeDir);
      
      projects.forEach(project => {
        if (project.endsWith('.md')) {
          generateProjectPage(path.join(localeDir, project), locale);
        }
      });
    }
  });
}

// Générer la page projets (liste)
function generateProjectsPage(locale) {
  const projectsDir = path.join(root, 'content', 'projects', locale);
  let projects = [];
  
  if (fs.existsSync(projectsDir)) {
    projects = fs.readdirSync(projectsDir)
      .filter(f => f.endsWith('.md'))
      .map(f => {
        const content = fs.readFileSync(path.join(projectsDir, f), 'utf8');
        const match = content.match(/^title:\s*"(.*?)"/m);
        const title = match ? match[1] : path.basename(f, '.md');
        const projectName = path.basename(f, '.md');
        return { name: projectName, title, file: locale === 'en' ? `${projectName}-en.html` : `${projectName}.html` };
      });
  }
  
  const lang = locale === 'en' ? 'en' : 'fr';
  const projectsList = projects.map(p => `<a href="${p.file}">${p.title}</a>`).join('\n');
  
  const html = `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Projets - Io Burgard</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header class="site-header">
    <nav class="main-nav" aria-label="Navigation principale">
      <a href="index.html">Io Burgard</a>
      <a href="bio${locale === 'en' ? '-en' : ''}.html">${locale === 'en' ? 'bio' : 'bio'}</a>
      <a href="projets${locale === 'en' ? '-en' : ''}.html">${locale === 'en' ? 'projects' : 'projets'}</a>
      <a href="contact${locale === 'en' ? '-en' : ''}.html">${locale === 'en' ? 'contact' : 'contact'}</a>
    </nav>
    <nav class="language" aria-label="Langue">
      <a ${locale === 'fr' ? 'class="active"' : ''} href="projets.html">français</a>
      <a ${locale === 'en' ? 'class="active"' : ''} href="projets-en.html">english</a>
    </nav>
  </header>
  <main class="project-list">
    ${projectsList}
  </main>
</body>
</html>`;
  
  const fileName = locale === 'en' ? 'projets-en.html' : 'projets.html';
  fs.writeFileSync(path.join(out, fileName), html);
  console.log(`Généré: ${fileName}`);
}

// Générer les pages projets pour les deux langues
generateProjectsPage('fr');
generateProjectsPage('en');

// Générer la page bio
function generateBioPage(locale) {
  const bioPath = path.join(root, 'content', 'settings', `bio.${locale}.md`);
  
  if (fs.existsSync(bioPath)) {
    const content = fs.readFileSync(bioPath, 'utf8');
    const htmlContent = marked.parse(content);
    const fixedHtmlContent = fixImagePaths(htmlContent);
    
    const html = `<!doctype html>
<html lang="${locale}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Bio - Io Burgard</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header class="site-header">
    <nav class="main-nav" aria-label="Navigation principale">
      <a href="index.html">Io Burgard</a>
      <a href="bio${locale === 'en' ? '-en' : ''}.html">${locale === 'en' ? 'bio' : 'bio'}</a>
      <a href="projets${locale === 'en' ? '-en' : ''}.html">${locale === 'en' ? 'projects' : 'projets'}</a>
      <a href="contact${locale === 'en' ? '-en' : ''}.html">${locale === 'en' ? 'contact' : 'contact'}</a>
    </nav>
    <nav class="language" aria-label="Langue">
      <a ${locale === 'fr' ? 'class="active"' : ''} href="bio.html">français</a>
      <a ${locale === 'en' ? 'class="active"' : ''} href="bio-en.html">english</a>
    </nav>
  </header>
  <main class="bio-content">
    ${fixedHtmlContent}
  </main>
</body>
</html>`;
    
    const fileName = locale === 'en' ? 'bio-en.html' : 'bio.html';
    fs.writeFileSync(path.join(out, fileName), html);
    console.log(`Généré: ${fileName}`);
  }
}

generateBioPage('fr');
generateBioPage('en');

// Copier les pages HTML existantes (accueil, contact)
const htmlFiles = ['index.html', 'en.html', 'contact.html', 'contact-en.html'];
htmlFiles.forEach(file => {
  const src = path.join(root, file);
  if (fs.existsSync(src)) {
    // Mettre à jour les liens dans les pages pour pointer vers le bon chemin
    let content = fs.readFileSync(src, 'utf8');
    
    // Remplacer les liens pour qu'ils pointent vers le bon chemin
    content = content.replace(/href="(bio|projets|contact|la-bete-dans-la-jungle|index|en)\.html"/g, 'href="$1.html"');
    content = content.replace(/href="(bio|projets|contact|la-bete-dans-la-jungle)-en\.html"/g, 'href="$1-en.html"');
    
    // Corriger les chemins des assets
    content = content.replace(/src="\/assets\//g, 'src="assets/');
    content = content.replace(/href="\/assets\//g, 'href="assets/');
    
    fs.writeFileSync(path.join(out, file), content);
    console.log(`Copié: ${file}`);
  }
});

// Copier le dossier content pour que Decap CMS puisse l'écrire
if (fs.existsSync(path.join(root, 'content'))) {
  fs.cpSync(path.join(root, 'content'), path.join(out, 'content'), { recursive: true });
}

console.log('Build terminé: site généré dans /docs');
