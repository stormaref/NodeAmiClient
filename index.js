const Axios = require('axios');
const env = require('./env.json')
const AmiClient = require('asterisk-ami-client');
let client = new AmiClient();

let server = ""
let port = 0
let username = ""
let secret = ""

let run = async function () {
    await getConfigs(env.configurationUrl)
    connect()
}

let getConfigs = async function (url) {
    let configs = await Axios.get(url)
    let data = configs.data;
    server = data.find(d => d.key === "VOIP:Server").value
    port = data.find(d => d.key === "VOIP:Port").value
    username = data.find(d => d.key === "VOIP:User").value
    secret = data.find(d => d.key === "VOIP:Password").value
}

let handleEvent = async function (event) {
    let eventType = event["Event"]
    switch (eventType) {
        case 'Bridge':
            bridgeEvent(event)
            break;

        default:
            // let str = JSON.stringify(event)
            // console.log(str)
            break;
    }
}

let bridgeEvent = async function (bridgeEvent) {
    if (bridgeEvent['Bridgestate'] === 'Link') {
        console.log(JSON.stringify(bridgeEvent))
        let phoneNumber = bridgeEvent['CallerID1']
        let uniqueId = bridgeEvent['Uniqueid1']
        let destination = bridgeEvent['CallerID2']
        let result = await Axios.get(`${env.callUrl}?destination=${destination}&callerId=${phoneNumber}&callId=${uniqueId}`)
        if (result.status === 200)
            console.log('sent!')
    }
}

let connect = function () {
    client.connect(username, secret, {
        host: server,
        port: port
    })
        .then(amiConnection => {

            client
                .on('connect', () => console.log('connect'))
                .on('event', event => handleEvent(event))
                .on('data', chunk => { })
                .on('response', response => console.log(response))
                .on('disconnect', () => console.log('disconnect'))
                .on('reconnection', () => console.log('reconnection'))
                .on('internalError', error => console.log(error))
                .action({
                    Action: 'Ping'
                });

            //  setTimeout(() => {
            //      client.disconnect();
            //  }, 5000);

        })
        .catch(error => console.log(error));
}

run()