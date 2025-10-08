const config = {
  githubProfile: "VOTRE_USERNAME_GITHUB",
  webhookAvatar: "URL_IMAGE_AVATAR_BOT",
  discordWebhook: "VOTRE_WEBHOOK_DISCORD",
  serverID: "VOTRE_SERVER_ID",
  checkInterval: 1200000 
};


let knownRepos = new Map();
let isFirstCheck = true;
let discordClient = null;

async function fetchGithubRepos() {
  try {
    const response = await fetch(`https://api.github.com/users/${config.githubProfile}/repos?sort=updated&per_page=100`);
    if (!response.ok) throw new Error(`Erreur GitHub API: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Erreur repos:', error);
    return null;
  }
}

async function fetchGithubProfile() {
  try {
    const response = await fetch(`https://api.github.com/users/${config.githubProfile}`);
    if (!response.ok) throw new Error(`Erreur GitHub API: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Erreur profil:', error);
    return null;
  }
}

async function sendDiscordEmbed(repo, profile, isNew) {
  const embed = {
    title: isNew ? `🆕 Nouveau Repository: ${repo.name}` : `🔄 Repository Mis à Jour: ${repo.name}`,
    description: repo.description || "Pas de description",
    url: repo.html_url,
    color: isNew ? 0x00ff00 : 0x0099ff,
    thumbnail: { url: profile.avatar_url },
    fields: [
      { name: "👤 Auteur", value: `[${profile.login}](${profile.html_url})`, inline: true },
      { name: "📝 Langage", value: repo.language || "Non spécifié", inline: true },
      { name: "📅 Créé le", value: new Date(repo.created_at).toLocaleDateString('fr-FR'), inline: true },
      { name: "🔄 Mis à jour le", value: new Date(repo.updated_at).toLocaleDateString('fr-FR'), inline: true }
    ],
    timestamp: new Date().toISOString(),
    footer: {
      text: `GitHub Activity Monitor • Server ID: ${config.serverID}`,
      icon_url: config.webhookAvatar
    }
  };

  const payload = {
    username: "Ishie",
    avatar_url: config.webhookAvatar,
    embeds: [embed]
  };

  try {
    const response = await fetch(config.discordWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error(`Erreur Webhook: ${response.status}`);
    console.log(`✅ Notification: ${repo.name}`);
  } catch (error) {
    console.error('Erreur webhook:', error);
  }
}

async function checkForUpdates() {
  console.log(`🔍 Vérification: ${config.githubProfile}`);
  
  const repos = await fetchGithubRepos();
  const profile = await fetchGithubProfile();
  
  if (!repos || !profile) {
    console.log('❌ Échec récupération données');
    return;
  }

  if (isFirstCheck) {
    repos.forEach(repo => {
      knownRepos.set(repo.id, {
        name: repo.name,
        updated_at: repo.updated_at
      });
    });
    console.log(`📦 ${repos.length} repos initialisés`);
    isFirstCheck = false;
    return;
  }

  for (const repo of repos) {
    if (!knownRepos.has(repo.id)) {
      console.log(`🆕 Nouveau: ${repo.name}`);
      await sendDiscordEmbed(repo, profile, true);
      knownRepos.set(repo.id, {
        name: repo.name,
        updated_at: repo.updated_at
      });
      await new Promise(resolve => setTimeout(resolve, 1000));
    } else {
      const known = knownRepos.get(repo.id);
      if (known.updated_at !== repo.updated_at) {
        console.log(`🔄 Mise à jour: ${repo.name}`);
        await sendDiscordEmbed(repo, profile, false);
        knownRepos.set(repo.id, {
          name: repo.name,
          updated_at: repo.updated_at
        });
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  console.log(`✅ Terminé. Prochaine: ${config.checkInterval / 60000}min`);
}

async function initDiscordBot() {
  if (!config.discordBotToken || config.discordBotToken === "VOTRE_BOT_TOKEN_DISCORD") {
    console.log('⚠️ Bot Discord non configuré (mode webhook uniquement)');
    return;
  }

  try {
    const { Client, GatewayIntentBits } = require('discord.js');
    
    discordClient = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
      ]
    });

    discordClient.on('ready', () => {
      console.log(`✅ Bot Discord connecté: ${discordClient.user.tag}`);
    });

    discordClient.on('messageCreate', async (message) => {
      if (message.author.bot) return;
      if (message.content !== config.commandPrefix) return;

      await message.reply('🔄 Vérification forcée en cours...');
      await checkForUpdates();
      await message.channel.send('✅ Vérification terminée !');
    });

    await discordClient.login(config.discordBotToken);
  } catch (error) {
    console.error('❌ Erreur Discord Bot:', error);
    console.log('⚠️ Mode webhook uniquement');
  }
}

console.log('🤖 GitHub Monitor démarré');
console.log(`👤 Profile: ${config.githubProfile}`);
console.log(`⏱️ Intervalle: ${config.checkInterval / 60000}min`);
console.log(`💬 Commande: ${config.commandPrefix}\n`);

checkForUpdates();
const intervalId = setInterval(checkForUpdates, config.checkInterval);

initDiscordBot();

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '> '
});

console.log(`💡 Terminal: ${config.commandPrefix} | Discord: ${config.commandPrefix}\n`);
rl.prompt();

rl.on('line', async (input) => {
  const command = input.trim();
  
  if (command === config.commandPrefix) {
    console.log('\n🔄 Vérification forcée...\n');
    await checkForUpdates();
  } else if (command === '/help') {
    console.log('\n📋 Commandes:');
    console.log(`  ${config.commandPrefix} - Vérification immédiate`);
    console.log('  /help - Aide');
    console.log('  /status - Statut\n');
  } else if (command === '/status') {
    console.log('\n📊 Statut:');
    console.log(`  Profile: ${config.githubProfile}`);
    console.log(`  Repos: ${knownRepos.size}`);
    console.log(`  Intervalle: ${config.checkInterval / 60000}min`);
    console.log(`  Bot Discord: ${discordClient ? 'Connecté' : 'Non configuré'}\n`);
  } else if (command.length > 0) {
    console.log(`❌ Commande inconnue. /help pour aide\n`);
  }
  
  rl.prompt();
});

process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt...');
  clearInterval(intervalId);
  if (discordClient) discordClient.destroy();
  rl.close();
  process.exit(0);
});

