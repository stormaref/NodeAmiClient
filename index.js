const AmiClient = require('asterisk-ami-client');
let client = new AmiClient();

let handleEvent = async function (event) {
    let eventType = event["Event"]
    switch (eventType) {
        case 'Bridge':
            bridgeEvent(event)
            break;
    
        default:
            let str = JSON.stringify(event)
            console.log(str)
            break;
    }
}

let bridgeEvent = async function (bridgeEvent) {
    let str = JSON.stringify(bridgeEvent)
    console.log(str)
}

client.connect('admin', 'password', {host: '192.168.1.4', port: 5038})
 .then(amiConnection => {
 
     client
         .on('connect', () => console.log('connect'))
         .on('event', event => handleEvent(event))
         .on('data', chunk => {})
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