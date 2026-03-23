# Jocha Official — Plateforme Musicale

> Plateforme musicale officielle de **Jocha**, artiste rap/trap tech.
> Écoute, explore la discographie, crée des playlists et vis l'expérience en mode PWA installable.

---

## Technologies

![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-alpine-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Fly.io](https://img.shields.io/badge/Fly.io-cdg-8B5CF6?style=for-the-badge&logo=fly.io&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-installable-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)

---

## Fonctionnalités

- **Lecteur audio complet** — lecture, pause, suivant, précédent, shuffle, repeat, volume, seek
- **File d'attente** — gestion dynamique de la file de lecture
- **Discographie complète** — albums, singles, EPs avec couvertures et métadonnées
- **Paroles synchronisées** — affichage des lyrics par piste
- **Recherche** — filtrage par titre, artiste, genre
- **Bibliothèque personnelle** — création et gestion de playlists
- **Vue plein écran** — mode lecteur immersif (now-playing)
- **Profil artiste** — biographie, stats, réseaux sociaux
- **Panneau admin** — gestion du contenu de la plateforme
- **PWA installable** — fonctionne hors ligne, raccourcis natifs, service worker

---

## Structure du projet

```plaintext
src/
├── app/              # Routes Next.js (App Router)
│   ├── album/        # Page détail album
│   ├── discography/  # Discographie complète
│   ├── library/      # Bibliothèque & playlists
│   ├── now-playing/  # Vue lecteur plein écran
│   ├── profile/      # Profil artiste
│   ├── search/       # Recherche
│   ├── admin/        # Interface d'administration
│   └── api/          # Routes API
├── components/       # Composants React
│   ├── layout/       # AppShell, navigation, sidebar
│   ├── player/       # Lecteur audio & contrôles
│   ├── home/         # Hero, tendances, recommandations
│   ├── album/        # Affichage album & tracklist
│   ├── discography/  # Grille discographie
│   ├── profile/      # Profil & édition
│   ├── admin/        # Panneau admin
│   ├── pwa/          # Service worker, install prompt
│   └── ui/           # Composants réutilisables
├── context/          # Contextes React globaux
│   ├── PlayerContext   # État du lecteur audio
│   ├── PlaylistContext # Gestion des playlists
│   ├── ArtistContext   # Données artiste
│   └── AdminContext    # Mode admin
├── data/             # Données statiques (albums, pistes, paroles...)
├── types/            # Types TypeScript
└── lib/              # Utilitaires
```

---

## Lancer le projet en local

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans le navigateur.

---

## Déploiement

### Docker

```bash
docker build -t jocha-music .
docker run -p 3000:3000 jocha-music
```

### Fly.io

```bash
fly deploy
```

Le déploiement cible la région **cdg** (Paris) avec HTTPS forcé.

---

## Variables d'environnement

| Variable    | Valeur par défaut | Description                     |
|-------------|-------------------|---------------------------------|
| `PORT`      | `3000`            | Port d'écoute du serveur        |
| `NODE_ENV`  | `production`      | Environnement d'exécution       |
| `AUDIO_DIR` | `/data/audio`     | Répertoire des fichiers audio   |
| `COVERS_DIR`| `/data/covers`    | Répertoire des pochettes        |
