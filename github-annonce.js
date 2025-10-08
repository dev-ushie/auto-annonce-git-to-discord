const config = {
  githubProfile: "VOTRE_USERNAME_GITHUB",
  webhookAvatar: "URL_IMAGE_AVATAR_BOT",
  discordWebhook: "VOTRE_WEBHOOK_DISCORD",
  serverID: "VOTRE_SERVER_ID",
  checkInterval: 1200000 
};


let knownRepos = new Map();
let isFirstCheck = true;


async function fetchGithubRepos() {
  try {
    const response = await fetch(`https://api.github.com/users/${config.githubProfile}/repos?sort=updated&per_page=100`);
    
    if (!response.ok) {
      throw new Error(`Erreur GitHub API: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération des repos:', error);
    return null;
  }
}


async function fetchGithubProfile() {
  try {
    const response = await fetch(`https://api.github.com/users/${config.githubProfile}`);
    
    if (!response.ok) {
      throw new Error(`Erreur GitHub API: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    return null;
  }
}


async function sendDiscordEmbed(repo, profile, isNew) {
  const embed = {
    title: isNew ? `🆕 Nouveau Repository: ${repo.name}` : `🔄 Repository Mis à Jour: ${repo.name}`,
    description: repo.description || "Pas de description",
    url: repo.html_url,
    color: isNew ? 0x00ff00 : 0x0099ff,
    thumbnail: {
      url: profile.avatar_url 
    },
    fields: [
      {
        name: "👤 Auteur",
        value: `[${profile.login}](${profile.html_url})`,
        inline: true
      },
      {
        name: "⭐ Stars",
        value: repo.stargazers_count.toString(),
        inline: true
      },
      {
        name: "🍴 Forks",
        value: repo.forks_count.toString(),
        inline: true
      },
      {
        name: "📝 Langage",
        value: repo.language || "Non spécifié",
        inline: true
      },
      {
        name: "📅 Créé le",
        value: new Date(repo.created_at).toLocaleDateString('fr-FR'),
        inline: true
      },
      {
        name: "🔄 Mis à jour le",
        value: new Date(repo.updated_at).toLocaleDateString('fr-FR'),
        inline: true
      }
    ],
    timestamp: new Date().toISOString(),
    footer: {
      text: `GitHub Activity Monitor • Server ID: ${config.serverID}`,
      icon_url: config.webhookAvatar
    }
  };

  const payload = {
    username: "GitHub Monitor",
    avatar_url: config.webhookAvatar,
    embeds: [embed]
  };

  try {
    const response = await fetch(config.discordWebhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Erreur Discord Webhook: ${response.status}`);
    }

    console.log(`✅ Notification envoyée pour: ${repo.name}`);
  } catch (error) {
    console.error('Erreur lors de l\'envoi du webhook:', error);
  }
}


async function checkForUpdates() {
  console.log(`🔍 Vérification des repos de ${config.githubProfile}...`);
  
  const repos = await fetchGithubRepos();
  const profile = await fetchGithubProfile();
  
  if (!repos || !profile) {
    console.log('❌ Impossible de récupérer les données');
    return;
  }

  if (isFirstCheck) {

    repos.forEach(repo => {
      knownRepos.set(repo.id, {
        name: repo.name,
        updated_at: repo.updated_at
      });
    });
    console.log(`📦 ${repos.length} repositories initialisés`);
    isFirstCheck = false;
    return;
  }


  for (const repo of repos) {
    if (!knownRepos.has(repo.id)) {
      // Nouveau repository
      console.log(`🆕 Nouveau repo détecté: ${repo.name}`);
      await sendDiscordEmbed(repo, profile, true);
      knownRepos.set(repo.id, {
        name: repo.name,
        updated_at: repo.updated_at
      });
      

      await new Promise(resolve => setTimeout(resolve, 1000));
    } else {

      const known = knownRepos.get(repo.id);
      if (known.updated_at !== repo.updated_at) {
        console.log(`🔄 Mise à jour détectée: ${repo.name}`);
        await sendDiscordEmbed(repo, profile, false);
        knownRepos.set(repo.id, {
          name: repo.name,
          updated_at: repo.updated_at
        });
        

        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  console.log(`✅ Vérification terminée. Prochaine vérification dans ${config.checkInterval / 60000} minutes`);
}


console.log('🤖 Bot GitHub Monitor démarré');
console.log(`👤 Profile surveillé: ${config.githubProfile}`);
console.log(`⏱️  Intervalle: ${config.checkInterval / 60000} minutes\n`);


checkForUpdates();


setInterval(checkForUpdates, config.checkInterval);

process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du bot...');
  process.exit(0);
});
