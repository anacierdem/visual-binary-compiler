/** @type {import('vite').UserConfig} */
export default {
    server: {
        host: "workstation.local",
        https: {
            key: "./ssl/local.key",
            cert: "./ssl/local.crt"
        }
    }
}