const elasticlunr = require('elasticlunr');

module.exports =  {

    //util functions
    getDate : function(){
        var d = new Date().toString();
        let arr = d.split(" ");
        let res = "" + arr[1] + " " + arr[2] + ", " + arr[3];
        return res;
    },



    // Send verification email
    sendEmail: function(name, email,  code){
        const mailjet = require ('node-mailjet')
            .connect('1ed9fcf3f0aaf996dfdb8186c7f5e47b', '398bd362ae69b63d48ca8f89dcdea73a');
        const request = mailjet
            .post("send", {'version': 'v3.1'})
            .request({
                "Messages":[
                    {
                        "From": {
                            "Email": "blog@bccto.me",
                            "Name": "Blog Service"
                        },
                        "To": [
                            {
                                "Email": email,
                                "Name": "passenger 1"
                            }
                        ],
                        "TemplateID": 1471745,
                        "TemplateLanguage": true,
                        "Subject": "[noreply] Blog Verification",
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

    },


    // Send forget email
    forgetEmail: function(name, email, encryped) {
        const mailjet = require('node-mailjet')
            .connect('1ed9fcf3f0aaf996dfdb8186c7f5e47b', '398bd362ae69b63d48ca8f89dcdea73a');
        const request = mailjet
            .post("send", {'version': 'v3.1'})
            .request({
                "Messages": [
                    {
                        "From": {
                            "Email": "blog@bccto.me",
                            "Name": "Blog service team"
                        },
                        "To": [
                            {
                                "Email": email,
                                "Name": "passenger 1"
                            }
                        ],
                        "TemplateID": 1472927,
                        "TemplateLanguage": true,
                        "Subject": "Reset password",
                        "Variables": {
                            "name": name,
                            "confirmation_link": encryped
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
    },



    // Paging Area
    paging: function(cur, end){
    let result = [1];
    let next;

    if(end <= 8){
        for(let i =2; i<=end; i++){
            result.push(i);
        }
    }else{
        if((cur < 5) && ((end-cur) > 3)){
            result.push(2,3,4,5,"...",end-1, end);
            next = 6;
        }

        if((cur >= 5) && ((end-cur) > 4)){
            result.push(cur-1, cur, cur+1, cur+2, "...", end-1, end);
            next = cur + 3;
        }

        if((cur >= 5) && ((end-cur) <= 4)){
            result.push(2, "...", end-4, end-3, end-2, end-1, end);
            next = end - 5;
        }
    }
    return [result, next];
},



    paginatedResults: function(model, criteria, limit, require) {
    return async (req, res, next) => {

        let page = parseInt(req.query.page);

        if(require){
            if (require == 'category'){
                criteria.category = req.params.param;
            }else if (require == 'userid'){
                criteria.category = req.query.type;
                criteria.author = req.params.param;
            }else if(require == 'userShow'){
                criteria.author = req.params.id;
            }
        }else{
            if(!page){
                page = 1;
                res.highlight = 1;
            }else{
                res.highlight = parseInt(req.query.page);
            }
        }

        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        // Get the series of the page number

        const totalNumber=await model.find(criteria).countDocuments().exec();
        const totalPage = Math.ceil(totalNumber/limit);


        let [series, jump] = module.exports.paging(page, totalPage);
        res.series = series;
        res.jump = jump;


        const results = {};

        if (endIndex < await model.find(criteria).countDocuments().exec()) {
            results.next = {
                page: page + 1,
            }
        }

        if (startIndex > 0) {
            results.previous = {
                page: page - 1,
            }
        }


        try {
            results.results = await model.find(criteria).sort({serial: 'desc', viewtimes: 'desc'}).limit(limit).skip(startIndex).exec();
            res.paginatedResults = results;
            next()
        } catch (e) {
            res.status(500).json({ message: e.message })
        }
    }
},







// Elastic search

    elastic: function(model, limit) {
        return async (req, res, next) => {
            var index = elasticlunr(function () {
                this.addField('title');
                this.addField('intro');
                this.addField('content');
            });

            await model.find({}, (err, doc) => {
                for (var i = 0; i < doc.length; i++) {
                    var sample = {
                        "id": doc[i].id,
                        'title': doc[i].title,
                        'intro': doc[i].intro,
                        'content': doc[i].content
                    };
                    index.addDoc(sample);
                }
            });

            const answer = [];



            const temp = index.search(req.query.q);
            for (var i = 0; i < temp.length; i++) {
                answer.push(temp[i].ref);
            }

            console.log(answer);

            // -----------------------------------------------------------------------------------

            const page = parseInt(req.query.page);
            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;

            // Get the series of the page number


            const totalNumber = await model.find().where('_id').in(answer).countDocuments().exec();

            res.size = totalNumber;
            const totalPage = Math.ceil(totalNumber / limit);


            let [series, jump] = module.exports.paging(page, totalPage);
            res.series = series;
            res.jump = jump;


            const results = {};

            if (endIndex < await model.find().where('_id').in(answer).countDocuments().exec()) {
                results.next = {
                    page: page + 1,
                }
            }

            if (startIndex > 0) {
                results.previous = {
                    page: page - 1,
                }
            }
            try {
                results.results = await model.find().where('_id').in(answer).limit(limit).skip(startIndex).exec();
                res.paginatedResults = results;
                next()
            } catch (e) {
                res.status(500).json({message: e.message})
            }
        }

    }



};