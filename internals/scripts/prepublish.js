const fs = require('fs-extra');
const homepage = require('../../package.json').homepage;

async function prepublish() {
    await fs.copy('app/images/icon-512x512.png', 'build/icon-512x512.png')
    const index = await fs.readFile('build/index.html', 'utf8')
    const indexWithFavicon = index.replace(
        '<meta name="mobile-web-app-capable" content="yes"><link rel="icon" href="/favicon.ico"/>', 
        `<meta name="mobile-web-app-capable" content="yes"><link rel="icon" href="${homepage}/favicon.ico"/>`
    )
    await fs.writeFile('build/index.html', indexWithFavicon, 'utf8')
}

prepublish()