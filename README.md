![Node.js](https://img.shields.io/badge/Node.js-v22+-brightgreen)
![GitHub](https://img.shields.io/badge/GitHub-Auto%20Annonce-blue)
![Discord](https://img.shields.io/badge/Discord-Webhook-blueviolet)

# 🤖 GitHub Discord Monitor Bot

Un bot Node.js qui surveille automatiquement un profil GitHub et envoie des notifications Discord lors de la création ou mise à jour de repositories.

## 📋 Prérequis

- Node.js (version 14 ou supérieure)
- npm (inclus avec Node.js)
- Un webhook Discord
- Un profil GitHub public à surveiller

## 🚀 Installation

1. **Cloner ou télécharger le projet**
   ```bash
   git clone <votre-repo>
   cd github-discord-monitor
   ```

2. **Initialiser le projet npm**
   ```bash
   npm init -y
   ```

3. **Installer les dépendances** (si nécessaire)
   ```bash
   npm install node-fetch
   ```
   > Note: Node.js 18+ inclut fetch nativement

## ⚙️ Configuration

Ouvrez le fichier `bot.js` et modifiez les paramètres dans l'objet `config`:

```javascript
const config = {
  githubProfile: "VOTRE_USERNAME_GITHUB",
  webhookAvatar: "URL_IMAGE_AVATAR_BOT",
  discordWebhook: "VOTRE_WEBHOOK_DISCORD",
  serverID: "VOTRE_SERVER_ID",
  checkInterval: 1200000 // 20 minutes (en millisecondes)
};
```

### 📝 Comment obtenir ces informations:

- **githubProfile**: Votre nom d'utilisateur GitHub
- **webhookAvatar**: URL d'une image pour l'avatar du bot
- **discordWebhook**: 
  1. Allez dans Paramètres du Serveur Discord
  2. Intégrations → Webhooks → Nouveau Webhook
  3. Copiez l'URL du webhook
- **serverID**: ID de votre serveur Discord
- **checkInterval**: Intervalle en millisecondes (1200000 = 20 min)

## 🎯 Utilisation

### Démarrer le bot

```bash
npm start
```

ou

```bash
node bot.js
```

### Arrêter le bot

Appuyez sur `Ctrl + C` dans le terminal

## 📦 Scripts npm disponibles

Ajoutez ces scripts dans votre `package.json`:

```json
{
  "scripts": {
    "start": "node bot.js",
    "dev": "node --watch bot.js"
  }
}
```

Ensuite utilisez:
- `npm start` - Lance le bot
- `npm run dev` - Lance avec rechargement automatique (Node.js 18+)

## 🔧 Fonctionnalités

- ✅ Détection automatique des **nouveaux repositories**
- ✅ Détection des **mises à jour** de repositories existants
- ✅ Notifications Discord avec **embeds élégants**
- ✅ Photo de profil GitHub dans les embeds
- ✅ Informations détaillées: stars, forks, langage, dates
- ✅ Couleurs différenciées (vert pour nouveau, bleu pour mise à jour)

## 📊 Exemple de notification Discord

Le bot envoie des embeds contenant:
- 🆕/🔄 Titre (Nouveau ou Mis à Jour)
- 📝 Description du repository
- 👤 Auteur avec lien vers le profil
- ⭐ Nombre de stars
- 🍴 Nombre de forks
- 📝 Langage principal
- 📅 Date de création et de dernière mise à jour

## ⚠️ Notes importantes

- Au **premier lancement**, le bot initialise tous les repos sans envoyer de notifications
- Les données sont stockées en **mémoire** (redémarrer le bot réinitialise le suivi)
- Respecte les **limites de l'API GitHub** (60 requêtes/heure sans authentification)
- Pause automatique entre les notifications pour éviter le rate limit Discord

## 🔒 Sécurité

⚠️ **Ne partagez JAMAIS votre webhook Discord publiquement!**

Pour une meilleure sécurité, utilisez des variables d'environnement:

1. Créez un fichier `.env`:
   ```env
   GITHUB_PROFILE=votre_username
   DISCORD_WEBHOOK=votre_webhook_url
   SERVER_ID=votre_server_id
   ```

2. Installez dotenv:
   ```bash
   npm install dotenv
   ```

3. Modifiez le code pour utiliser:
   ```javascript
   require('dotenv').config();
   
   const config = {
     githubProfile: process.env.GITHUB_PROFILE,
     discordWebhook: process.env.DISCORD_WEBHOOK,
     // ...
   };
   ```

4. Ajoutez `.env` à votre `.gitignore`

## 📄 Licence

MIT

## 🤝 Contribution

Les contributions sont les bienvenues! N'hésitez pas à ouvrir une issue ou une pull request.

---

Créé avec ❤️ pour surveiller l'activité GitHub

