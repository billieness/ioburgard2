const fs = require('fs');
const path = require('path');

const root = __dirname;
const out = path.join(root, '..', 'docs'); // Génère dans /docs à la racine du dépôt

// Nettoyer et recréer le dossier de sortie
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

// Copier les fichiers statiques
fs.cpSync(path.join(root, 'assets'), path.join(out, 'assets'), { recursive: true });
fs.cpSync(path.join(root, 'admin'), path.join(out, 'admin'), { recursive: true });
fs.copyFileSync(path.join(root, 'config.yml'), path.join(out, 'config.yml'));
fs.copyFileSync(path.join(root, 'style.css'), path.join(out, 'style.css'));

// Copier les pages HTML existantes
const htmlFiles = ['index.html', 'bio.html', 'bio-en.html', 'contact.html', 'contact-en.html',
                   'projets.html', 'projets-en.html',
                   'la-bete-dans-la-jungle.html', 'la-bete-dans-la-jungle-en.html',
                   'la-bete-dans-la-jungle-2.html', 'la-bete-dans-la-jungle-2-en.html'];
htmlFiles.forEach(file => {
  const src = path.join(root, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(out, file));
  }
});

// Copier le dossier content
if (fs.existsSync(path.join(root, 'content'))) {
  fs.cpSync(path.join(root, 'content'), path.join(out, 'content'), { recursive: true });
}

// Copier les PDFs
if (fs.existsSync(path.join(root, 'portfolio.pdf'))) {
  fs.copyFileSync(path.join(root, 'portfolio.pdf'), path.join(out, 'portfolio.pdf'));
}

console.log('Build terminé: site généré dans /docs');
