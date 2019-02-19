const YAML = require('yaml')
const path = require('path')
const fs = require('fs')
const uid = require('uid')

const sanitize = require('./utils')

const rootDir = path.join(__dirname, '../../app')

const OLD_EVENT_FOLDER = path.join(rootDir, './app/resources/blog')
const EVENT_YAML_PATH = path.join(OLD_EVENT_FOLDER, 'Articles.yaml')
const LIBRARY_FOLDER = path.join(rootDir, './client/resources/images/library')
const EVENT_FOLDER = path.join(rootDir, './client/resources/website/data/articles')

const eventsFile = fs.readFileSync(EVENT_YAML_PATH, 'utf8')
const events = YAML.parse(eventsFile)

events.forEach(e => {
    e.isDownload = false

    if(e.download) {
        e.isDownload = true
    }

    if(e.file) {
        e.content = fs.readFileSync(path.join(OLD_EVENT_FOLDER, e.file)).toString()
        e.content = e.content.replace(/\/_\/api\/blog\/([^">)]+)/gmi, mached => {
            const file = mached.match(/\/[^\/]*\/[^\/]*$/)[0]
            console.log(mached, file)
            let name = path.basename(mached)
            try {
                if(fs.existsSync(path.join(LIBRARY_FOLDER,path.basename(mached)))) {
                    name = uid(20) + name
                }
                fs.copyFileSync(path.join(OLD_EVENT_FOLDER, file), path.join(LIBRARY_FOLDER,name))
            } catch (e) {
                console.log(e)
            }
            return `/images/library/${name}`
        })
        delete e.file
    }
    if(e.featuredImage) {
        let fiName = path.basename(e.featuredImage)
        if(fs.existsSync(path.join(LIBRARY_FOLDER,path.basename(e.featuredImage)))) {
            fiName = uid(20) + fiName
        }
        fs.copyFileSync(path.join(OLD_EVENT_FOLDER, e.featuredImage), path.join(LIBRARY_FOLDER,fiName))
        e.featuredImage = `/images/library/${fiName}`
    }
    fs.writeFileSync(path.join(EVENT_FOLDER, sanitize(e.header.toLowerCase()) + '.yml'), YAML.stringify(e), 'utf8')
})
