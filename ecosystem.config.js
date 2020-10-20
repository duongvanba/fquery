const base_env = {
    API_PORT: 8080,
    GOOGLE_APPLICATION_CREDENTIALS: `${__dirname}/gg.json`,
}

const env = {
    ...base_env
}

if (['dump', 'show', 'echo'].some(key => process.argv.includes(key))) {
    console.log(`\n${Object.keys(env).map(key => `export ${key}=${env[key]}`).join('\n')}\n`)
}



module.exports = {
    apps: [
        {
            name: 'api',
            script: 'build/src/modules/api/index.js',
            autorestart: false,
            watch: true,
            max_memory_restart: '4G',
            env
        }
    ]
};
