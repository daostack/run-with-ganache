#!/usr/bin/env node

const { exec, execSync } = require('child_process');
const { basename } = require('path')
require('colors')

const ownName = basename(process.argv[1])

if(process.argv.length < 3) {
    console.error(
`run with '${ownName} [--ganache-cmd Ganache] [Ganache options] cmd'

Make sure that cmd is a standalone shell argument.
For example, if trying to 'truffle migrate && truffle test'
alongside a Ganache sc fork instance with 2 addresses:

  ${ownName} --ganache-cmd ganache-sc -a 2 'truffle migrate && truffle test'
`
    )
    process.exit(2)
}

let ganacheArgs = process.argv.slice(2, -1)
let ganacheCmd = 'ganache-cli'
if(ganacheArgs[0] === '--ganache-cmd') {
    ganacheCmd = ganacheArgs[1]
    ganacheArgs = ganacheArgs.slice(2)
}
const cmd = process.argv[process.argv.length - 1]

let ganache
new Promise((resolve, reject) => {
    const handleError = (err) => {
        if(err.code === 'ENOENT')
            return reject(new Error(`Could not find ${ganacheCmd}`))
        if(err.code === 'EACCES')
            return reject(new Error(`Need permission to execute ${ganacheCmd}`))
        return reject(err)
    }

    try {
        ganache = exec(ganacheCmd, ganacheArgs)
    } catch(err) {
        return handleError(err)
    }

    ganache.stdout.on('data', (data) => {
        if(data.includes('Listening')) {
            resolve()
        }
    })

    let error = ''

    ganache.stderr.on('data', (data) => {
        error += data
    })

    ganache.on('error', handleError)

    ganache.on('close', (code) =>
        reject(new Error(`${ganacheCmd} exited early with code ${code}`))
    )
}).then(() => {
    execSync(cmd, { stdio: 'inherit' })
}).then(() => {
    //need to increment ganache.pid because exec launches a shell and then runs the commands
    process.kill(ganache.pid+1)
    ganache.kill()
    process.exit()
}).catch((err) => {
    if(ganache) ganache.kill()
    console.error(`\n  ${err.message.red}\n`)
    process.exit(1)
})
