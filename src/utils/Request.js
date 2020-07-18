/* REQUEST FUNCTIONS */

const axios = require('axios')
const qs = require('qs')
const BASE_URL = "http://localhost:5000"

function GetBase(){
  return BASE_URL
}

function Get (api, param, noBase, callback) {

  let url = noBase ? api : BASE_URL + api

  url = url + constParam(param)

  console.log(url)
  
  axios.get(url).then((response) => {

      callback({status: true, data: response.data})

  }).catch((err) => {
      
      callback({status: false, error: err})

  })
}

async function AsyncGet(api, param={}, noBase=true){
  console.log(api)
  let url = noBase ? api : BASE_URL + api
  
  url = url + constParam(param)
  

  let data = await (await fetch(url)).json()

  return data
}

function Post (api, data, noBase, callback){


    api = noBase ? api : BASE_URL + api

    const postData = qs.stringify(data)


    axios.post(api, postData)
      .then(function (response) {
          if(response){
            callback({status: true, data: response.data}, false)
            return 
          }else{
            callback({status: false, data: response.data})
            return 
          }
      })
      .catch(function (error) {
        callback({status: false, data: null, err: error})
        return 
      })
}

function PostJSON(api, data, noBase, callback){
    api = noBase ? api : BASE_URL + api

    const postData = JSON.stringify(data)

    //console.log(postData)

    axios.post(api, postData, {headers: {'Content-Type': 'application/json'}})
      .then(function (response) {
          if(response){
            callback({status: true, data: response.data}, false)
            return 
          }else{
            callback({status: false, data: response.data})
            return 
          }
      })
      .catch(function (error) {
        callback({status: false, data: null, err: error})
        return 
      })
}

// Construct url with paramaters
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


module.exports = {
    Get: Get,
    Post: Post,
    PostJSON: PostJSON,
    GetBase: GetBase,
    AsyncGet: AsyncGet
}