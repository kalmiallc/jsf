const shell = require('shelljs');

module.exports = (plop) => {

  /******************************
   * Constants
   ******************************/

    // Material color palettes
  const colorPalettes = [
      'red',
      'pink',
      'purple',
      'deep-purple',
      'indigo',
      'blue',
      'light-blue',
      'cyan',
      'teal',
      'green',
      'light-green',
      'lime',
      'yellow',
      'amber',
      'orange',
      'deep-orange',
      'brown',
      'grey',
      'blue-grey'
    ];

  /******************************
   * Custom helpers
   ******************************/

  // Themes
  plop.setHelper('themeName', (text) => plop.getHelper('dashCase')(text.split('/').reverse()[0]));
  plop.setHelper('themeClassName', (text) => plop.getHelper('pascalCase')(text.split('/').reverse()[0]) + 'Component');
  plop.setHelper('themeModuleName', (text) => plop.getHelper('pascalCase')(text.split('/').reverse()[0]) + 'Module');


  /******************************
   * Custom actions
   ******************************/

  plop.setActionType('patch-angular', (answers, config, plop) => {
    return new Promise((resolve, reject) => {
      if (answers.updateAngularJson) {
        const shellExec = shell.exec('npm run patch-angular');
        if (shellExec.code === 0) {
          resolve('Done');
        } else {
          reject('Failed');
        }
      } else {
        resolve('Skipped');
      }
    });
  });


  /******************************
   * Generators
   ******************************/

  // Theme
  plop.setGenerator('theme', {
    description: 'Create a new PCF theme',
    prompts    : [
      {
        type   : 'input',
        name   : 'theme',
        message: 'Choose a theme name (example: my-client)'
      },
      {
        type   : 'list',
        name   : 'colorPrimary',
        message: 'Choose a primary color',
        choices: colorPalettes
      },
      {
        type   : 'list',
        name   : 'colorAccent',
        message: 'Choose an accent color',
        choices: colorPalettes
      },
      {
        type   : 'confirm',
        name   : 'updateAngularJson',
        message: 'Would you like to automatically patch angular.json file?'
      }
    ],

    actions: [
      {
        type         : 'addMany',
        base         : 'generators/theme',
        templateFiles: 'generators/theme',
        globOptions  : {
          dot: true
        },
        destination  : 'themes/{{ theme }}'
      },
      {
        type : 'patch-angular',
        speed: 'slow'
      }
    ]
  });


};
