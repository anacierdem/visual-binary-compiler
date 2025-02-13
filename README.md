# Visual binary editor

This is a very early prototype of a web based tool to interface with byte-stream devices like serial interfaces. The core idea is building a UI for various external devices like microcontroller programmers, serial configuration tools, MIDI devices via SysEx etc. It will be able to visualize the serial output for monitoring purposes and provide user input to adjust its settings. Potential use cases:

- Configuring R/C transmitters
- Providing UIs to synths
- MIDI librarian
- Programming microcontrollers
- Uploading files to flash carts

It is currently fully built on litegraph.js but it is getting heavily modified to modernize and clean it. At some point, it will either get replaced or become unrecognizable. OTOH, it provides a great stepping stone for initial prototyping.
The core idea resembles the capabilities of `https://github.com/WerWolv/ImHex` but for data streaming & on the web. I don't know if I'll adopt a similar [pattern language](https://github.com/WerWolv/PatternLanguage/) (maybe even compatible).
The project is currently at a very early experimentation phase. It basically provides me something to work with Web Serial, USB and MIDI APIs and primarily serves my curiosity. I don't know how useful or feature complete it may become. I only have a few crude custom nodes implemented for serial input/output.

You can try it at: https://builder.alinacierdem.com/ You'll see a very basic setup trying to interface with a [SummerCart64](https://github.com/Polprzewodnikowy/SummerCart64/blob/main/docs/03_usb_interface.md#resetting-communication).

## Starting the project locally

`npm run dev`

### Create SSL cert

To be able to use the Serial API locally, you need to have a locally trusted certificate.

`cd ./ssl`

CA:
`openssl genrsa -des3 -out myCA.key 2048`

Root cert:
`openssl req -x509 -new -nodes -key myCA.key -sha256 -days 1825 -out myCA.pem -subj "/C=XX/ST=/L=/O=/OU=/CN=local"`

Private key:
`openssl genrsa -out local.key 2048`

CSR:
`openssl req -new -key local.key -out local.csr -subj "/C=XX/ST=/L=/O=/OU=/CN=local"`

Cert:
`openssl x509 -req -in local.csr -CA myCA.pem -CAkey myCA.key -CAcreateserial -out local.crt -days 825 -sha256 -extfile local.ext`

#### Install cert

https://learn.microsoft.com/en-us/windows-hardware/drivers/install/trusted-root-certification-authorities-certificate-store

#### Local deploy

`npx wrangler pages deploy ./dist`