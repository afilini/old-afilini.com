let debugTerminal = null; // TODO: remove!

const writers = {};

$(document).ready(() => {
  WebFont.load({
    custom: {
      families: ['Ubuntu Mono'],
      urls: ['/styles/ubuntu-mono.css']
    },
    active: () => {
      const renderer = new Renderer();
      renderer.init();

      renderer.terminal.interpreter.addCommand('donate', donateCommand);
      // renderer.terminal.interpreter.addCommand('bitcoin-cli', bitcoinCommand);

      renderer.terminal.interpreter.addCommand('credits', creditsCommand);

      debugTerminal = renderer.terminal; // TODO: remove!

      writers['init'] = God.fromText(renderer.terminal, 'whoami', GOD_TYPE_DEFINED, [0.089, 0.021, 0.083, 0.152, 0.042, 0.47]);

      writers['credits'] = God.fromText(renderer.terminal, 'credits', GOD_TYPE_RANDOM,  0.1);
      writers['donate'] = God.fromText(renderer.terminal, 'donate', GOD_TYPE_RANDOM,  0.1);

      $('.my-animated').addClass('animated').removeClass('my-animated');
      renderer.postEffect.startGlitch(0.6, 3.0);
      setTimeout(() => writers['init'].start(), 2000);
    }
  });

  $('#obfuscate-addr').attr('href', `mailto:${'alekos' + '.' + 'filini'}@${'gmail' + '.' + 'com'}`);

  $('#donate-link').click((e) => {
    e.preventDefault();

    writers['donate'].resetAndStart();
  });

  $('#credits-link').click((e) => {
    e.preventDefault();

    writers['credits'].resetAndStart();
  });
});
