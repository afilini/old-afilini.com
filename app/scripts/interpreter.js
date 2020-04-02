class Command {
  constructor(binary, help, callback){
    this.binary = binary;
    this.help = help;
    this.callback = callback;
  }
  run(argc, argv, stdoutCallback, doneCallback, terminal) {
    this.callback(argc, argv, stdoutCallback, doneCallback, terminal);
  }
}

function whoamiHandler(argc, argv, stdout, done) {
  stdout('Alekos Filini - @afilini');
  stdout('Bitcoin Developer - Magical Bitcoin');
  stdout('');
  stdout('9222 07BA 3642 BE16 0216 73D2 5E8A FC30 34FD FA4F');
  stdout('alekos.filini[at]gmail.com');
  stdout('twitter.com/afilini');
  stdout('github.com/afilini');

  setTimeout(done, 500);
}

function clearHandle(a, b, c, done, terminal) {
  done();
  terminal.clear();
}

class Interpreter {
  constructor(terminal) {
    this.terminal = terminal;

    this.commands = {
      'help': new Command('help', 'Prints this message', (a, b, c, d) => this.helpHandler(a, b, c, d)),
      'whoami': new Command('whoami', 'Prints the contact details', whoamiHandler),
      'clear': new Command('clear', 'Clears the screen', clearHandle)
    }
  }

  addCommand(name, cmd) {
    this.commands[name] = cmd;
  }

  run(command, stdout, done) {
    const parts = command.trim().split(/[ ]+/);
    const binary = parts[0];

    parts.splice(0, 1);

    if (!this.commands[binary]) {
      stdout(`${binary}: command not found...`);
      done();
    } else {
      this.commands[binary].run(parts.length, parts, stdout, done, this.terminal);
    }
  }

  helpHandler(argc, argv, stdout, done) {
    stdout('afilini\'s shell, v0.1-beta');
    stdout('');

    const longestKey = Object.keys(this.commands).map(s => s.length).reduce((a, b) => Math.max(a, b), 0);

    for (let key in this.commands) {
      if (this.commands.hasOwnProperty(key)) {
        stdout(`${this.commands[key].binary}${' '.repeat(longestKey - key.length + 8)}${this.commands[key].help}`);
      }
    }

    stdout('');

    setTimeout(done, 300);
  }
}
