// The TrueKnowledeg plugin.

var https = require('https')
var DomJS = require('dom-js').DomJS;
var util = require('util')

var trueKnowledge = {
    api_account_id : 'api_account_id',
    api_password : 'api_password'
}

function parseTrueKnowledgeResponseObject(obj) {
    if(obj && obj.name === 'tk:response') {
        var answer = "Sorry. I couldn't understand what you are asking. Please rephrase.";
        for (var i = 0, len = obj.children.length; i < len; ++i) {
            if(obj.children[i].name && obj.children[i].name === 'tk:text_result') {
                for (var j = 0, len2 = obj.children[i].children.length; j < len2; ++j) {
                    if(obj.children[i].children[j].text) {
                        answer = obj.children[i].children[j].text;
                        return answer;
                    }   
                }
            }
            if(obj.children[i].name && obj.children[i].name === 'tk:error_message') {
                for (var j = 0, len2 = obj.children[i].children.length; j < len2; ++j) {
                    if(obj.children[i].children[j].text) {
                        answer = obj.children[i].children[j].text;
                        return answer;
                    }   
                }
            }
        }
        return answer;
    }
    return null;
}

function doQuery(ircSession, sayTo, param) {
    var query = "/direct_answer?wikipedia,official&question=" + 
                param + 
                "&api_account_id=" +  trueKnowledge.api_account_id + 
                "&api_password=" + trueKnowledge.api_password;
    
    console.log("Query: " + encodeURI(query));
    var options = {
      host: 'api.trueknowledge.com',
      path: encodeURI(query)
    };

    req = https.get(options, function(res) {
        var data = '';
        //console.log("statusCode: ", res.statusCode);
        //console.log("headers: ", res.headers);
        res.setEncoding('utf8');
        res.on('data', function(d) {
            data += d;
        });
        res.on('end', function() {
            if(res.statusCode === 200 && data) {
                var domjs = new DomJS();
                domjs.parse(data, function(err, dom) {
                    answer = parseTrueKnowledgeResponseObject(dom);
                    if(answer) {
                        ircSession.say(sayTo, answer);
                    }
                });
            }
        });
        
    });
    
    req.on('error', function(e) {
      console.error(e);
    });
}


// ------------------------------------------------------------
// Command object, that will be added to the command list
// ------------------------------------------------------------
var trueKnowledgeCommand = {
    name: "trueknowledge",
    callback: function (ircSession, from, to, param) {
        if(to.charAt(0) === "#") {
            doQuery(ircSession, to, param);
        }
        else {
            doQuery(ircSession, from, param);
        }
    }
}
commands.push(trueKnowledgeCommand);
