const fse = require('fs-extra');
const path = require('path');

function main(flavour) {
  const from = path.join('.', 'flavours', flavour);
  const options = { overwrite: true, preserveTimestamps: true };
  console.log(`Activating flavour from ${from}.`);

  const configSrc = path.join(from, 'config.json');
  const configDest = path.join('.', 'src', 'config.json');
  fse.copySync(configSrc, configDest, options);

  const publicSrc = path.join(from, 'public');
  const publicDest = path.join('.', 'public');
  fse.emptyDirSync(publicDest);
  fse.copySync(publicSrc, publicDest, options);

}

main(process.argv[2]);