var Enquirer = require('enquirer')
var fs       = require('fs-extra')

var enquirer = new Enquirer()

var questions = [
  enquirer.question({
    name: 'name',
    default: 'mocked name',
    prefix: '\ufeff'  // TODO :: https://github.com/enquirer/prompt-base/issues/7
  }),
  enquirer.question({
    name: 'version',
    default: '1.0.0',
    prefix: '\ufeff'  // TODO :: https://github.com/enquirer/prompt-base/issues/7
  })
]

enquirer.ask(questions).then(function(answers) {
  return fs.outputFile('temp.json', JSON.stringify(answers))
})
