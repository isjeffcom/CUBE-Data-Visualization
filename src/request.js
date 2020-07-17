const BASE_URL = "http://localhost:5000"

export function get(api, param, noBase, callback){
    let url = noBase ? api : BASE_URL + api

    url = url + constParam(param)

    fetch(url).then((res)=>{
        if(res.status == 200){
            if(isJsonString(res)){
                res.json().then((data)=>{
                    callback({status: true, data: data, msg: null})
                })
            } else {
                callback({status: true, data: res, msg: null})
            }
            
        } else {
            callback({status: false, data: null, msg: "Unknow error: " + res})
        }
        
    }).catch((err)=>{
        callback({status: false, data: null, msg: "Error: " + err})
    })
}


async function AsyncGet(api, param, noBase){

    let url = noBase ? api : BASE_URL + api
    url = url + constParam(param)

    let data = await (await fetch(url)).json()

    return data
}


function constParam(obj){
    let res = ""
    let i = 0
    let len = Object.keys(obj).length

    if(len == 0) return ""

    for(let key in obj){
        if(i == 0){
            res += "?" + key + "=" + obj[key]
        }
        
        else {
            res += "&" + key + "=" + obj[key]
        }

        i++
    }

    return res
}

function isJsonString(str) {
    try {
        JSON.parse(str)
    } catch (e) {
        return false
    }
    return true
}