/* REQUEST FUNCTIONS */

const axios = require('axios')
const qs = require('qs')
const baseUrl = "/"

function Get (api, param, noBase, callback) {

    api = noBase ? api : baseUrl + api
    
    axios.get(contParam(api, param)).then((response) => {

        callback({status: true, data: response.data})

    }).catch((err) => {
        
        callback({status: false, error: err})

    })
}

function Post (api, data, noBase, callback){


    api = noBase ? api : baseUrl + api

    const postData = qs.stringify(data)

    //console.log(postData)

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
    api = noBase ? api : baseUrl + api

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
function contParam (api, param) {
    
    // Assumble get url paramaters
    if(param.length > 0){
        api = api + "?"
        
        
        for(var i=0;i<param.length;i++){

            if(i == param.length - 1){
                
                api = api + param[i].name + "=" + param[i].val
            } else {
                api = api + param[i].name + "=" + param[i].val + "&"
            } 
        }    
    }

    return api
}


module.exports = {
    Get: Get,
    Post: Post,
    PostJSON: PostJSON
}