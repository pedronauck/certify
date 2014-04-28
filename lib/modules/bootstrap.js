'use strict';

var fs = require('fs');
var path = require('path');
var sh = require('shelljs');
var inquirer = require('inquirer');

var questions = require('../helpers/questions');
var templatePath = path.join(__dirname, '../../templates');

// ----------------------------------------------------------------------------
//  Private Methods
// ----------------------------------------------------------------------------

function _createMsg(msg) {
  sh.echo('   create '.done + msg);
}

function _createFolder(name) {
  _createMsg('/' + name);
  sh.mkdir(name);
}

function _createFile(dir, filename) {
  var folderName = dir.match(/\w+$/g)[0];

  if (dir !== templatePath) {
    _createMsg('/' + folderName + '/' + filename);
    sh.cd(folderName);
    sh.cp(path.join(dir, filename), filename);
    sh.cd('..');
  }
  else {
    _createMsg(filename);
    sh.cat(dir + '/' + filename).to(filename);
  }
}

// ----------------------------------------------------------------------------
//  Public Methods
// ----------------------------------------------------------------------------

var generator = module.exports = {
  gotQuestions: function(cb) {
    inquirer.prompt(questions, function(answers) {
      var courseData = {
        'name': answers.courseName,
        'startDate': answers.startDate,
        'endDate': answers.endDate,
        'totalHours': answers.totalHours,
        'city': answers.city,
        'state': answers.state
      };

      cb(courseData);
    });
  },

  install: function(data) {
    console.log(templatePath);
    _createFolder('images');
    _createFile(path.join(templatePath, 'images'), 'assign.png');

    _createFolder('css');
    _createFile(path.join(templatePath, 'css'), 'style.css');

    _createFile(templatePath, 'index.html');
    _createFile(templatePath, 'gulpfile.js');
    _createFile(templatePath, 'participants.csv');

    _createMsg('config.json');
    JSON.stringify(data, null, 2).to('config.json');
  },

  runDependencies: function() {
    var errorMsg;

    if (!sh.which('npm') && !sh.which('node')) {
      errorMsg = 'Oops, NodeJS isn\'t installed. Please install it!';
      console.log(errorMsg.italic.error);
    }

    if (!sh.which('git')) {
      errorMsg = 'Oops, Git isn\'t installed. Please install it!';
      console.log(errorMsg.italic.error);
    }

    if (sh.which('npm') && sh.which('node') && sh.which('git')) {
      sh.exec('npm install gulp gulp-connect gulp-swig',
        function (err, output) {
          if (err) {
            console.log(err);
          }
      });
    }
  }
};
