const YAML = require('yaml')
const path = require('path')
const fs = require('fs')

const sanitize = require('./utils')

const rootDir = path.join(__dirname, '../../app')

const OLD_EVENT_FOLDER = path.join(rootDir, './app/resources/blog')
const EVENT_YAML_PATH = path.join(OLD_EVENT_FOLDER, 'Authors.yaml')
const LIBRARY_FOLDER = path.join(rootDir, './client/resources/images/library')
const EVENT_FOLDER = path.join(rootDir, './client/resources/website/data/authors')

const eventsFile = fs.readFileSync(EVENT_YAML_PATH, 'utf8')
const events = YAML.parse(eventsFile)



events.forEach(e => {
    if(e.avatar.indexOf('/_/api/') >= 0)
        e.avatar = `/images/library/${path.basename(e.avatar)}`
    fs.writeFileSync(path.join(EVENT_FOLDER, sanitize(e.name.toLowerCase()) + '.yml'), YAML.stringify(e), 'utf8')
})
