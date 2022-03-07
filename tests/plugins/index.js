const { lighthouse, prepareAudit } = require('@cypress-audit/lighthouse');
const fs = require('fs');
const webpackPreprocessor = require('@cypress/webpack-preprocessor');

module.exports = (on, config) => {
  let namespaceName = process.env.NAMESPACE_NAME || null;
  // generate random namespace name if it wasn't provided as env
  const random = Math.floor(Math.random() * 9999) + 1000;
  const randomName = `a-busola-test-${random}`;
  if (!namespaceName) {
    namespaceName = randomName;
  }
  const dynamicSharedStore = {
    cancelTests: false,
  };

  config.env.NAMESPACE_NAME = namespaceName;
  config.env.STORAGE_CLASS_NAME = randomName;

  on('file:preprocessor', webpackPreprocessor());

  on('before:browser:launch', (browser = {}, launchOptions) => {
    prepareAudit(launchOptions);
  });

  on('task', {
    lighthouse: lighthouse(),
    removeFile(filePath) {
      fs.unlinkSync(filePath);
      return null;
    },
    listDownloads(downloadsDirectory) {
      return fs.readdirSync(downloadsDirectory);
    },
    // invoke setter cy.task('dynamicSharedStore', { name: 'cancelTests', value: true })
    // invoke getter cy.task('dynamicSharedStore', { name: 'cancelTests' })
    dynamicSharedStore(property) {
      console.log('dynamic shared store', property);
      if (property.value !== undefined) {
        dynamicSharedStore[property.name] = property.value;
      }
      return dynamicSharedStore[property.name] ?? null;
    },
  });
  return config;
};
