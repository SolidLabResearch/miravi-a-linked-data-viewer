const fse = require('fs-extra');
const path = require('path');

function main(config) {
  const from = path.join('.', 'configs', config);
  const options = { overwrite: true, preserveTimestamps: true };
  console.log(`Activating configuration from ${from}.`);

  const configSrc = path.join(from, 'config.json');
  const configDest = path.join('.', 'src', 'config.json');
  fse.copySync(configSrc, configDest, options);

  const publicDefaults = path.join('.', 'config-defaults', 'public');
  const publicSrc = path.join(from, 'public');
  const publicDest = path.join('.', 'public');
  fse.emptyDirSync(publicDest);
  fse.copySync(publicDefaults, publicDest, options);
  fse.copySync(publicSrc, publicDest, options);

}

main(process.argv[2]);