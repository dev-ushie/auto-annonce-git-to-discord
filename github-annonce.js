const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const configPath = path.join(__dirname, '../config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8')); // lecture de la config

let lastRepos = {}; // stocke le dernier commit README connu pour chaque repo

// Récupère les infos du profil GitHub
async function fetchGitHubProfile() {
    try {
        const res = await fetch(`https://api.github.com/users/${config.githubProfile}`);
        return await res.json();
    } catch (err) {
        console.error('Erreur fetch GitHub profile:', err);
        return null;
    }
}

// Récupère les repos du profil, triés par dernière mise à jour
async function fetchRepos() {
    try {
        const res = await fetch(`https://api.github.com/users/${config.githubProfile}/repos?sort=updated`);
        const data = await res.json();
        if (!Array.isArray(data)) console.error('Erreur GitHub API:', data.message || data);
        return Array.isArray(data) ? data : [];
    } catch (err) {
        console.error('Erreur fetch GitHub repos:', err);
        return [];
    }
}

// Récupère le dernier commit README d’un repo
async function fetchLastReadmeCommit(repoName) {
    try {
        const res = await fetch(`https://api.github.com/repos/${config.githubProfile}/${repoName}/commits?path=README.md&per_page=1`);
        const data = await res.json();
        return data[0]?.sha || null;
    } catch (err) {
        console.error('Erreur fetch README commit:', err);
        return null;
    }
}

// Envoie un embed Discord pour annoncer un nouveau commit README
async function sendDiscordEmbed(repo, profile) {
    const embed = {
        username: `${config.githubProfile} GitHub`,
        avatar_url: profile?.avatar_url,
        embeds: [{
            title: repo.name,
            description: `[${repo.name}](${repo.html_url})\n${repo.description || 'Pas de description.'}`,
            color: 0x1abc9c,
            thumbnail: { url: profile?.avatar_url },
            timestamp: new Date(),
            footer: { text: 'auto-annonce-git-to-discord', icon_url: profile?.avatar_url }
        }]
    };

    try {
        await fetch(config.discordWebhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(embed)
        });
        console.log(`Annonce envoyée pour le repo : ${repo.name}`);
    } catch (err) {
        console.error('Erreur Discord webhook:', err);
    }
}

// Vérifie tous les repos et envoie une annonce si le README a changé
async function checkUpdates() {
    const profile = await fetchGitHubProfile();
    const repos = await fetchRepos();

    for (const repo of repos) {
        const lastSHA = await fetchLastReadmeCommit(repo.name);

        if (!lastRepos[repo.name]) {
            lastRepos[repo.name] = lastSHA; // premier check
            await sendDiscordEmbed(repo, profile);
            continue;
        }

        if (lastSHA && lastSHA !== lastRepos[repo.name]) {
            await sendDiscordEmbed(repo, profile);
            lastRepos[repo.name] = lastSHA; // mise à jour
        }
    }
}

// Exécution initiale + boucle périodique
checkUpdates();
setInterval(checkUpdates, config.checkInterval);
