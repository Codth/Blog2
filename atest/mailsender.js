
function sending (name, code){
    const mailjet = require ('node-mailjet')
        .connect('1ed9fcf3f0aaf996dfdb8186c7f5e47b', '398bd362ae69b63d48ca8f89dcdea73a');
    const request = mailjet
        .post("send", {'version': 'v3.1'})
        .request({
            "Messages":[
                {
                    "From": {
                        "Email": "blog@bccto.me",
                        "Name": "sss"
                    },
                    "To": [
                        {
                            "Email": "blog@bccto.me",
                            "Name": "passenger 1"
                        }
                    ],
                    "TemplateID": 1471745,
                    "TemplateLanguage": true,
                    "Subject": "[[code:]]",
                    "Variables": {
                        "name": name,
                        "code": code
                    }
                }
            ]
        })
    request
        .then((result) => {
            console.log(result.body)
        })
        .catch((err) => {
            console.log(err.statusCode)
        });
}



sending("Trump", 16888);
