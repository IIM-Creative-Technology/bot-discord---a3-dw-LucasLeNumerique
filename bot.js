const clientLoader = require('./src/clientLoader');
const commandLoader = require('./src/commandLoader');
const levelManager = require('./levelManager')
const conn = require('./src/MySqlConnector');
require('colors');

const COMMAND_PREFIX = '!';

conn.connect()

clientLoader.createClient(['GUILDS', 'GUILD_MESSAGES', 'GUILD_MEMBERS'])
  .then(async (client) => {
    commandLoader.load(client);

    // Rôle attribué dès l'arrivée au serveur
    client.on('guildMemberAdd', async (member) => {
      const guild = member.guild;
      // Assignation du rôle "Recrue"
      const role = await guild.roles.fetch('940638707260751913');
      await member.roles.add(role);
      await member.roles.add('940638707260751913');
      console.log(`Nouvel user enregistré !`)
    })

    client.on('messageCreate', async (message) => {

      levelManager.levelup(message)

      // Ne pas tenir compte des messages envoyés par les bots, ou qui ne commencent pas par le préfix
      if (message.author.bot || !message.content.startsWith(COMMAND_PREFIX)) return;

      // Découpage du message pour récupérer les mots
      const words = message.content.split(' ');

      const commandName = words[0].slice(1); // Le premier mot du message, auquel on retire le préfix
      const arguments = words.slice(1); // Tous les mots suivants sauf le premier

      if (client.commands.has(commandName)) {
        // La commande existe, on la lance
        client.commands.get(commandName).run(client, message, arguments);
      } else {
        // La commande n'existe pas, on prévient l'utilisateur
        await message.delete();
        await message.channel.send(`The ${commandName} does not exist.`);
      }
    })
  });
