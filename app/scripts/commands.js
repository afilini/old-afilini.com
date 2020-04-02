const donateCommand = new Command('donate', 'Generates a new Bitcoin address', (argc, argv, stdout, done) => {
    const addr = '3B3M6GtTEWCEjo1xXaoi8vLnuoGxep1rVA';
    stdout('Bitcoin address: ' + addr);

    const qr = new JSQR();
    const code = new qr.Code();

    code.encodeMode = code.ENCODE_MODE.BYTE;
    code.version = code.DEFAULT;
    code.errorCorrection = code.ERROR_CORRECTION.H;

    const input = new qr.Input();
    input.dataType = input.DATA_TYPE.TEXT;
    input.data = {
      text: 'bitcoin:' + addr
    };

    const matrix = new qr.Matrix(input, code);

    matrix.scale = 8;
    matrix.margin = 3;

    const canvas = document.createElement('canvas');

    canvas.setAttribute('width', matrix.pixelWidth);
    canvas.setAttribute('height', matrix.pixelWidth);
    canvas.getContext('2d').fillStyle = 'rgb(255,255,255)';
    canvas.getContext('2d').fillRect(0, 0, matrix.pixelWidth, matrix.pixelWidth);
    canvas.getContext('2d').fillStyle = 'rgb(0,0,0)';
    matrix.draw(canvas, 0, 0);

    stdout(canvas);

    done();
  }
);

const creditsCommand = new Command('credits', 'Awesome open-source stuff used in this website', (argc, argv, stdout, done) => {
  stdout('CodeMyUI\'s "GLSL Glitch":      https://gist.github.com/CodeMyUI/57ee8509af603222de60d104b4559b21');
  stdout('jQuery:                        https://jquery.com');
  stdout('Bootstrap:                     https://getboostrap.com');
  stdout('WebFontLoader:                 https://github.com/typekit/webfontloader');
  stdout('JSQR:                          http://www.jsqr.de');
  stdout('');

  done();
});

const muteCommand = new Command('mute', 'Mutes the background music', (argc, argv, stdout, done) => {
  done();
});

const unmuteCommand = new Command('unmute', 'Un-mutes the background music', (argc, argv, stdout, done) => {
  done();
});

const bitcoinCommand = new Command('bitcoin-cli', 'Cool bitcoin utils', (argc, argv, stdout, done) => {
  function printHelp() {
    stdout('Bitcoin command line interface. Available commands:');
    stdout('');
    stdout('help                       prints this message');
    stdout('getbestblockhash           returns the best block hash');
    stdout('sendrawtransaction         broadcasts a transaction into the network');
    stdout('validateaddress            validates a bitcoin address');
    stdout('disableblocknotif          disables the new block notifications');
    stdout('enableblocknotif           enables the new block notifications');
    stdout('');
  }

  console.log(argc, argv);

  if (argc < 1) {
    printHelp();
    return done();
  }

  if (argv[0] === 'help') {
    printHelp();
  } else if (argv[0] === 'getbestblockhash') {
    // TODO
  } else if (argv[0] === 'sendrawtransaction') {

  } else if (argv[0] === 'validateaddress') {

  } else if (argv[0] === 'disableblocknotif') {

  } else if (argv[0] === 'enableblocknotif') {

  }

  done();
});
