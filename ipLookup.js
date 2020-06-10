const iploc = require("ip2location-nodejs");
const Traceroute = require('nodejs-traceroute');

iploc.IP2Location_init("./IP2LOCATION-LITE-DB5.BIN");

let testip = '208.113.185.144';

function getIPInfo(ip_addr){
  let info = {}
  info.ipaddr = ip_addr;
  info.city = iploc.IP2Location_get_city(ip_addr);
  info.country = iploc.IP2Location_get_country_short(ip_addr);
  info.lat = iploc.IP2Location_get_latitude(ip_addr);
  info.long = iploc.IP2Location_get_longitude(ip_addr);
  return info
}

// console.log(getIPInfo(testip))

function runLookup(domain){
  return new Promise((resolve, reject)=>{
    let route = [];
    let routeLookup = [];
    const tracer = new Traceroute();
    tracer
        .on('destination', (destination) => {
            console.log(`destination: ${destination}`);
        })
        .on('hop', (hop) => {
          // console.log(hop)
          if(hop['ip']!='*'){
            route.push(hop)
          }
        })
        .on('close', (code) => {
          console.log(`close: code ${code}`);
          // console.log(route)
          route.forEach((hop)=>{
            console.log(getIPInfo(hop.ip))
            routeLookup.push(getIPInfo(hop.ip))
          })
          resolve(routeLookup);
            
        });
      tracer.trace(domain);
  })
}

exports.getIPInfo = getIPInfo;
exports.runLookup = runLookup;
