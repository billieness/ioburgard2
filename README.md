# Io Burgard - Site avec Decap CMS

## Structure du projet
- `io-burgard/` : Dossier principal du site
  - `config.yml` : Configuration de Decap CMS
  - `admin/index.html` : Point d'entrée pour Decap CMS
  - `build.js` : Script de build
  - `dist/` : Dossier de sortie (généré par `npm run build`)
  - `content/` : Contenu géré par Decap CMS
  - `assets/` : Images et uploads

## Déploiement avec GitHub Pages

### 1. Activer GitHub Pages
1. Allez dans **Settings → Pages** de votre dépôt GitHub
2. Sélectionnez la branche `main`
3. Sélectionnez le dossier `/io-burgard/dist` comme source
4. Cliquez sur **Save**

### 2. Configurer Decap CMS avec GitHub
1. **Créez un Personal Access Token (PAT) GitHub** :
   - Allez dans **Settings → Developer settings → Personal access tokens**
   - Générez un token avec la permission `repo`
   - Copiez le token (il ne sera plus visible après)

2. **Configurez le backend dans `config.yml`** :
   ```yaml
   backend:
     name: github
     repo: billieness/ioburgard2
     branch: main
   ```

### 3. Accéder à Decap CMS
- Une fois déployé, allez sur : `https://votre-utilisateur.github.io/ioburgard/admin/`
- Decap CMS utilisera GitHub pour l'authentification

## Build local
```bash
cd io-burgard
npm install
npm run build
```

## Notes
- Le site est **100% statique** (pas de serveur nécessaire)
- Decap CMS permet de modifier le contenu directement depuis GitHub
- Les images sont stockées dans `assets/uploads/`
