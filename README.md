# Visual binary editor

`npm run dev`

### Create SSL cert

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