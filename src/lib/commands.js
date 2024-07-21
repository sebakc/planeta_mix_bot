/**
 * Commands class to handle creating and executing commands. It use observables to subscribe to commands.
 */
class Commands {
  constructor(app) {
    this.app = app
    this.commands = [];
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
  
  printHelp(from) {
    const to = from || this.app.CHANNEL
    this.commands.forEach(({ name, description, command, aliases }) => {
      aliases = aliases.length ? `[${aliases.join(", ")}] - ` : ""
      this.app.say(to, `${command}: ${aliases}${description}`)
    })
  }
  /**
   * Subscribe to the command
   * @param {function} callback - The callback to execute
   */
  echo({ message, name, description, command, aliases }) {
    const action = () => this.app.say(this.app.CHANNEL, message)
    return { name, description, command, aliases, action };
  }
  custom({ callback, params, name, description, command, aliases }) {
    const action =  ({params, message}) => callback({ app: this.app, params, message })
    return { name, description, command, aliases, action };
  }
}
module.exports = Commands;