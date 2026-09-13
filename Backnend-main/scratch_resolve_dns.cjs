const dns = require('dns');

console.log('Testing DNS lookup using Google DNS (8.8.8.8)...');
dns.setServers(['8.8.8.8']); // Force Google DNS

dns.resolveSrv('_mongodb._tcp.cluster01.ficueyg.mongodb.net', (err, addresses) => {
    if (err) {
        console.error('SRV Lookup Failed:', err.message);
    } else {
        console.log('SUCCESS! Found the cluster nodes:');
        console.log(addresses);
        
        // Let's also get the TXT record for auth options
        dns.resolveTxt('cluster01.ficueyg.mongodb.net', (errTxt, txts) => {
            if (!errTxt) console.log('TXT Records:', txts);
        });
    }
});
