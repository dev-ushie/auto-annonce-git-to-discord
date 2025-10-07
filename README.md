![Node.js](https://img.shields.io/badge/Node.js-v22+-brightgreen)
![GitHub](https://img.shields.io/badge/GitHub-Auto%20Annonce-blue)
![Discord](https://img.shields.io/badge/Discord-Webhook-blueviolet)

Un bot Node.js qui surveille un **profil GitHub** et envoie automatiquement des **annonces sur Discord** via webhook quand :  

- Un **nouveau projet** est publié  
- Le **README d’un projet existant** est mis à jour  
- Au premier lancement, tous les projets existants sont annoncés  

L’annonce utilise un **embed Discord** avec le **nom du repo**, une **description**, le **lien `[Nom](Lien)`** et le **petit avatar GitHub**.

---

## Fonctionnalités

- Détection automatique des **nouveaux repos**  
- Détection automatique des **mises à jour README**  
- Envoi **embellie avec embed Discord**  
- Annonce tous les projets existants au premier lancement  
- Configuration simple via `config.json`  

---

## Installation

1. Cloner le repo :

```bash
git clone https://github.com/TonPseudoGitHub/auto-annonce-git-to-discord.git
cd auto-annonce-git-to-discord
````

2. Installer les dépendances :

```bash
npm install
```

---

## Configuration

Créer ou modifier le fichier `config.json` dans le **dossier parent du script** (par exemple `../config.json`) :

```json
{
  "githubProfile": "TonPseudoGitHub",
  "discordWebhook": "https://discord.com/api/webhooks/ID/TOKEN",
  "serverID": "TonServerID",
  "checkInterval": 1200000
}
```

* **githubProfile** : le pseudo GitHub que tu veux surveiller
* **discordWebhook** : ton webhook Discord pour les annonces
* **serverID** : ton serveur Discord (optionnel, pour référence)
* **checkInterval** : intervalle en millisecondes pour vérifier les mises à jour (ici 5 minutes)

---

## Lancement

Lancer le bot :

```bash
node module/github-annonce.js
```

* Au premier lancement, tous les projets existants seront annoncés sur Discord
* Ensuite, seules les **nouveautés** et **README mis à jour** seront annoncés

---

## Exemple d’annonce Discord

**Format de l’annonce :**

```
📢 Projet détecté: NomDuRepo
[NomDuRepo](https://github.com/TonPseudoGitHub/NomDuRepo)
Description du projet ici
```

* Le **thumbnail** : petit avatar GitHub du profil
* Le **footer** : `auto-annonce-git-to-discord`

---

## Conseils

* Assure-toi que ton **webhook Discord** a les permissions pour **envoyer des embeds**
* Augmente ou diminue `checkInterval` selon ton besoin pour ne pas saturer l’API GitHub
* Ce bot peut tourner **en arrière-plan** avec `pm2` ou autre gestionnaire de processus

```


