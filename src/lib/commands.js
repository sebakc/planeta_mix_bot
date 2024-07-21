/**
 * Commands class to handle creating and executing commands. It use observables to subscribe to commands.
 */
class Commands {
  constructor(app) {
    this.app = app
    this.commands = [];
    this.help = [];
  }
  /**
   * add a new command
   * @param {string} command - The command to create
   */
  add(command) {
    this.commands.push(command);
  }
  /**
   * Execute the command
   */
  execute() {
    this.commands.next(this.command);
  }
  
  printHelp() {
    this.help.forEach(({ name, description }) => {
      const commands = this.help.map(({ command, aliases }) => `${command} (${aliases.join(', ')})`)
      this.app.say(this.app.CHANNEL, `${name}: ${commands} - ${description}`)
    })
  }
  /**
   * Subscribe to the command
   * @param {function} callback - The callback to execute
   */
  echo({ message, name, description, command, aliases }) {
    const action = () => this.app.say(this.app.CHANNEL, message)
    this.help.push({ name, description, command, aliases });
    return { name, description, command, aliases, action };
  }
  custom({ callback, params, name, description, command, aliases }) {
    const action =  ({params, message}) => callback({ app: this.app, params, message })
    this.help.push({ name, description, command, aliases });
    return { name, description, command, aliases, action };
  }
}
module.exports = Commands;