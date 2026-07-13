# Io Burgard - Site Web avec Decap CMS

Ce dépôt contient le site web de Io Burgard avec une intégration Decap CMS pour la gestion de contenu.

## Structure

- `io-burgard/` : Fichiers sources du site
  - `content/` : Contenu géré par Decap CMS (projets, bio, etc.)
  - `assets/` : Images et fichiers statiques
  - `admin/` : Configuration Decap CMS
  - `build.js` : Script de build qui génère les pages HTML
- `docs/` : Site généré (déployé sur GitHub Pages)
- `.github/workflows/deploy.yml` : Workflow de déploiement

## Configuration requise

### 1. Configurer GitHub Pages

1. Allez dans **Settings > Pages** de ce dépôt
2. Sélectionnez **Branch: main** et **Folder: /docs**
3. Sauvegardez

Le site sera accessible à : https://billieness.github.io/ioburgard2/

### 2. Configurer Decap CMS

Decap CMS utilise l'authentification GitHub. Vous avez besoin d'un **Personal Access Token (PAT)** avec les permissions suivantes :
- `repo` (accès complet aux dépôts)
- `workflow` (pour déclencher les builds)

#### Créer un PAT :
1. Allez dans **Settings > Developer settings > Personal access tokens > Tokens (classic)**
2. Cliquez sur **Generate new token**
3. Donnez un nom (ex: "Decap CMS - Io Burgard")
4. Sélectionnez les permissions : `repo` et `workflow`
5. Générez le token et **copiez-le** (il ne sera plus visible après)

#### Configurer Decap CMS :
1. Accédez à : https://billieness.github.io/ioburgard2/admin/
2. Decap CMS vous demandera de vous authentifier
3. Sélectionnez **GitHub** comme backend
4. Entrez votre **username GitHub** et le **PAT** que vous venez de créer
5. Autorisez l'accès

### 3. Utilisation

Une fois connecté, vous pouvez :
- **Créer/modifier des projets** : Allez dans la collection "Projets"
- **Modifier la biographie** : Allez dans "Paramètres du site" > "Biographie"
- **Ajouter des images** : Utilisez le widget "Image" dans les projets

Les changements seront automatiquement :
1. Commités sur la branche `main`
2. Le workflow GitHub Actions sera déclenché
3. Le site sera regénéré et déployé sur GitHub Pages

## Développement local

Pour tester localement :

```bash
cd io-burgard
npm install
npm run build
```

Le site généré sera dans `/docs`. Vous pouvez le servir localement avec :

```bash
cd docs
python3 -m http.server 8000
```

Puis accédez à : http://localhost:8000

## Résolution des problèmes

### Decap CMS ne trouve pas la configuration
- Vérifiez que `/admin/config.yml` existe dans le site déployé
- Vérifiez que le chemin est correct dans `admin/index.html`

### Les images ne s'affichent pas
- Vérifiez que les chemins dans le Markdown sont relatifs (ex: `assets/image.webp`)
- Ne pas utiliser de `/` initial

### Les changements ne sont pas visibles
- Vérifiez que le workflow GitHub Actions s'est exécuté avec succès
- Vérifiez que les fichiers dans `/docs` ont été mis à jour
- Attendez quelques minutes pour que GitHub Pages se rafraîchisse

## Notes

- Le site utilise **GitHub Pages** pour l'hébergement (gratuit)
- Decap CMS utilise **GitHub comme backend** (pas besoin de Netlify)
- Le build est **statique** : toutes les pages sont générées à l'avance
- Les images uploadées via Decap CMS sont stockées dans `assets/uploads/`
