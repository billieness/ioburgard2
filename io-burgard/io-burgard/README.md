# Io Burgard — site éditable

Ce site est conçu pour être hébergé sur Netlify et édité depuis Decap CMS.

## Première mise en ligne

1. Importez **tout le contenu de ce dossier** dans le dépôt GitHub `billieness/ioburgard`.
2. Dans Netlify, reliez ce dépôt au site existant. Le fichier `netlify.toml` indique automatiquement à Netlify de lancer `npm run build` et de publier le dossier `dist`.
3. Dans Netlify, allez dans **Integrations → Identity → Netlify Identity**, puis cliquez sur **Enable**.
4. Dans les réglages Identity, choisissez **Invite only**.
5. Dans **Services**, cliquez sur **Enable Git Gateway**.
6. Dans Identity, envoyez-vous une invitation à votre adresse e-mail.

Ensuite, l’interface de gestion est disponible à :

`https://votre-domaine.netlify.app/admin/`

## Ajouter un projet

1. Connectez-vous à `/admin/`.
2. Ouvrez **Projets**, puis **Nouveau projet**.
3. Renseignez le titre, la date, le texte et les images.
4. Publiez la version française, puis créez sa traduction anglaise dans l’interface.

Decap crée les fichiers Markdown dans `content/projects/fr/` et `content/projects/en/`. Netlify reconstruit automatiquement le site quelques secondes après la publication.

Les images envoyées depuis Decap sont enregistrées dans `public/assets/uploads/` et seront accessibles sur le site sous `/assets/uploads/`.

## Modifier les pages fixes

Dans `/admin/`, la rubrique **Pages du site** permet de modifier :

- les liens et images de la page d’accueil ;
- la bio française et anglaise ;
- le PDF du portfolio.

Après une publication, le site et le lien de téléchargement du portfolio sont mis à jour automatiquement.
