/**
 * Commands class to handle creating and executing commands. It use observables to subscribe to commands.
 */
class Commands {
  constructor() {
  }
  /**
   * Create a new command
   * @param {string} command - The command to create
   */
  create(command) {
    this.command = command;
  }
  /**
   * Execute the command
   */
  execute() {
    this.commands.next(this.command);
  }
}
module.exports = Commands;