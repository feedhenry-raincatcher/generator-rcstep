'use strict';

const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const path = require('path');

module.exports = class extends Generator {
  prompting() {
    // Have Yeoman greet the user.
    this.log(yosay('' + chalk.red('RainCatcher Step') + ' generator!'
    ));

    const array = this.env.cwd.split('/');
    const prompts = [{
      type: 'input',
      name: 'appName',
      message: 'Your step name',
      // Defaults to the project's folder name if the input is skipped
      default: this.appName || array[array.length - 1]
    }, {
      type: 'input',
      name: 'description',
      message: 'Your step description',
      // Defaults to the project's folder name if the input is skipped
      default: this.description || "Custom RainCatcher step"
    }, {
      type: 'confirm',
      name: 'mkdirBool',
      message: 'Would you like to create a folder?',
      default: true
    }];

    return this.prompt(prompts.slice(0, 2)).then(props => {
      const done = this.async();
      this.inputs = props;
      this.appName = this.inputs.appName.trim().split(' ').join('-');
      this.description = this.inputs.description.trim();

      return this.prompt(prompts[2]).then(prop => {
        this.inputs.mkdirBool = prop.mkdirBool;
        this.mkdirBool = prop.mkdirBool;
        done();
      })
        .catch(err => console.error(err));
    });
  }

  writing() {
    // Change cwd based on prompt
    let copyPath = this.env.cwd;
    if (this.mkdirBool) {
      copyPath = this.appName;
    }

    // Copy package.json
    this.fs.copyTpl(
      this.templatePath('_package.json'),
      this.destinationPath(path.join(copyPath, 'package.json')), {
        appName: this.appName,
        description: this.description
      }
    );
    // Copy grunt
    this.fs.copyTpl(
      this.templatePath('Gruntfile.js'),
      this.destinationPath(path.join(copyPath, 'Gruntfile.js')), {
        appName: this.appName
      }
    );

    // Copy source code
    this.fs.copyTpl(
      this.templatePath('lib'),
      this.destinationPath(path.join(copyPath, 'lib')), {
        appName: this.appName,
        description: this.description
      }
    );

    // Copy templates
    this.fs.copy(this.templatePath('template/base-form.tpl.html'),
      this.destinationPath(path.join(copyPath, 'lib/angular/template/' + this.appName + '-form.tpl.html')));
    this.fs.copy(this.templatePath('template/base.tpl.html'),
      this.destinationPath(path.join(copyPath, 'lib/angular/template/' + this.appName + '.tpl.html')));

    // All static root files
    this.fs.copy(this.templatePath('static/README.md'), this.destinationPath(path.join(copyPath, 'README.md')));
    this.fs.copy(this.templatePath('static/eslintrc'), this.destinationPath(path.join(copyPath, '.eslintrc')));
    this.fs.copy(this.templatePath('static/gitignore'), this.destinationPath(path.join(copyPath, '.gitignore')));
  }

  install() {
    // Install dependencies in new directory
    const npmdir = path.join(process.cwd(), this.appName);
    if (this.mkdirBool) {
      process.chdir(npmdir);
    }
    var self = this;
    this.npmInstall(null, {}, function() {
      self.spawnCommandSync("grunt", ["wfmTemplate:build"]);
    });
  }
};
