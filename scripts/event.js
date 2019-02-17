const YAML = require('yaml')
const path = require('path')
const fs = require('fs')

const sanitize = require('./utils')

const rootDir = path.join(__dirname, '../')

const OLD_EVENT_FOLDER = path.join(rootDir, './app/resources/events')
const EVENT_YAML_PATH = path.join(OLD_EVENT_FOLDER, 'Events.yaml')
const LIBRARY_FOLDER = path.join(rootDir, './client/resources/images/library')
const EVENT_FOLDER = path.join(rootDir, './client/resources/website/data/events')

const eventsFile = fs.readFileSync(EVENT_YAML_PATH, 'utf8')
const events = YAML.parse(eventsFile)



events.forEach(e => {
    e.selfHosted = false

    if(e.file) {
        e.selfHosted = true
        e.content = fs.readFileSync(path.join(OLD_EVENT_FOLDER, e.file)).toString()

        delete e.file
    }

    fs.copyFileSync(path.join(OLD_EVENT_FOLDER, e.featuredImage), path.join(LIBRARY_FOLDER,path.basename(e.featuredImage)))

    e.featuredImage = `/images/library/${path.basename(e.featuredImage)}`
    fs.writeFileSync(path.join(EVENT_FOLDER, sanitize(e.header.toLowerCase()) + '.yml'), YAML.stringify(e), 'utf8')
})
