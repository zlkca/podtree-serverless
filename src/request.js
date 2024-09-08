const http = require('https');

function postRequest(hostname, path, data, options) {
    const opts = {
        hostname,
        port: 443,
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'accept': 'application/json'
        },
        path,
        ...options 
    };

    return new Promise((resolve, reject) => {
        const req = http.request(opts, (res) => {
            
            let s = "";
            res.setEncoding('utf8');

            res.on('data', (chunk) => {
                s += chunk;
                // console.log(`BODY: ${chunk}`);
            });

            res.on('end', () => {
                // console.log('No more data in response.');
                if (s) {
                    const ret = JSON.parse(s);
                    // console.log(s)
                    resolve(ret);
                } else {
                    resolve();
                }
            });
        });
        
        req.on('error', (e) => {
            console.error(`problem with request: ${e.message}`);
            resolve();
        });
        
        // write data to request body
        req.write(JSON.stringify(data));
        req.end();
    });
}

// async function requestRdb(path, data, token){
//     const p = RdbENV === 'prod' ? `/dev${path}` : path;
//     return await sendRequest(p, data, {
//         ...options,
//         headers: {
//             'content-type': 'application/json',
//             'accept': 'application/json',
//             Authorization: `Bearer ${token}`,
//         }
//     });
// }

// path eg. /autocomplete
function getRequest(url, options) {
    const opts =  {
        headers: {
            'content-type': 'application/json',
            'accept': 'application/json'
        },
        ...options
    }

    return new Promise((resolve, reject) => {


        const req = http.get(url, opts, (res) => {
            
            let s = "";
            res.setEncoding('utf8');

            res.on('data', (chunk) => {
                s += chunk;
                // console.log(`BODY: ${chunk}`);
            });

            res.on('end', () => {
                // console.log('No more data in response.');
                if (s) {
                    const ret = JSON.parse(s);
                    // console.log(s)
                    resolve(ret);
                } else {
                    resolve();
                }
            });
        });
        
        req.on('error', (e) => {
            console.error(`problem with request: ${e.message}`);
            resolve();
        });
        
        req.end();
    });
}



// const geoPlaceOptions = {
//     hostname: "https://us1.locationiq.com/v1",
//     port: 443,
//     method: 'GET',
//     headers: {
//         'content-type': 'application/json',
//         'accept': 'application/json'
//     }
// };

// async function getLocationIqSuggestGeoPlaces(keyword){
//     const url = `https://api.locationiq.com/v1/autocomplete?key=pk.64b273060d00b07815bafe72313041c1&countrycodes=ca&q=${keyword}`;
//     const rs =await getRequest(url);
//     if(rs && rs.length > 0){
//         return rs.map(r => ({displayAddress: r.display_address, address: r.address}));
//     }else{
//         return [];
//     }
// }

// Refer: https://developers.google.com/maps/documentation/places/web-service/autocomplete
// components=country:us|country:pr|country:vi|country:gu|country:mp
// Response: 
// {"predictions":
//     [
//       {
//         "description": "Paris, France",
//         "matched_substrings": [{ "length": 5, "offset": 0 }],
//         "place_id": "ChIJD7fiBh9u5kcRYJSMaMOCCwQ",
//         "reference": "ChIJD7fiBh9u5kcRYJSMaMOCCwQ",
//         "structured_formatting":
//           {
//             "main_text": "Paris",
//             "main_text_matched_substrings": [{ "length": 5, "offset": 0 }],
//             "secondary_text": "France",
//           },
//         "terms":
//           [
//             { "offset": 0, "value": "Paris" },
//             { "offset": 7, "value": "France" },
//           ],
//         "types": ["locality", "political", "geocode"],
//       },
//       ...
//     ]
// }

// https://maps.googleapis.com/maps/api/place/autocomplete/json?input=hoodview&key=AIzaSyCXL72uH_RrPw0OIw3U6OCPTzuhJJ5-dgs&components=country:ca`;
// async function getGoogleSuggestGeoPlaces(keyword){
//     const GOOGLE_MAPS_API_KEY = "AIzaSyCXL72uH_RrPw0OIw3U6OCPTzuhJJ5-dgs"
//     const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${keyword}&key=${GOOGLE_MAPS_API_KEY}&components=country:ca`;
//     console.log(url);
//     const rsp = await getRequest(url);
//     console.log(JSON.stringify(rsp, null, 2))
//     if(rsp && rsp.status === "OK"){
//         return rsp.predictions;
//     }else{
//         return [];
//     }
// }
module.exports = {
    postRequest,
    getRequest
};