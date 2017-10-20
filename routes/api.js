var express = require('express');
var router = express.Router();
var config = require("../config/private.json");
var cors = require('cors');
var bcrypt = require("bcrypt-nodejs");
var saltRounds = 10;

var admin_firebase = require("firebase-admin");
var db = admin_firebase.database();
var usersRef = db.ref('users');
var regSubsRef = db.ref('reg_subsidiary');

var elasticSearch = require('elasticsearch');
var client = elasticSearch.Client({
    host: 'localhost:9200'
});

var nodemailer = require("nodemailer");
var transporter = nodemailer.createTransport(config.smtp);

router.post('/check_user', cors(), function (req, res, next) {
    req.assert('email', 'Email is required!').notEmpty();
    req.assert('password', 'Password is required!').notEmpty();
    req.getValidationResult().then(function (result) {
        var errors = result.useFirstErrorOnly().array();
        if (errors.length > 0) {
            return res.json({status: "failed", message: errors[0].msg});
        } else {
            usersRef.orderByChild('email').equalTo(req.body.email).once('value').then(function (userSnap) {
                let userData = userSnap.val();
                if (userData !== null) {
                    let keys = Object.keys(userData);
                    let sel_user = userData[keys[0]];
                    if (bcrypt.compareSync(req.body.password, sel_user.password)) {
                        if (sel_user.act_status) {
                            admin_firebase.auth().createCustomToken(keys[0]).then(function (token) {
                                return res.json({"status": "ok", "token": token});
                            }).catch(function (err) {
                                return res.json({"status": "failed", "message": "Error creating custom token: " + err});
                            });
                        } else {
                            return res.json({status: "failed", message: "Deactivate your account!"});
                        }
                    } else {
                        return res.json({status: "failed", message: "Invalid credentials!"});
                    }
                } else {
                    return res.json({status: "failed", message: "Invalid email!"});
                }
            });
        }
    });
});

router.get('/get_codes', function (req, res, next) {
    let project = req.query.project;
    let input = req.query.input;
    client.search({
        index: 'reg_subs',
        type: 'id',
        body: {
            _source: input + "*",
            query: {
                match: {
                    _id: project
                }
            }
        }
    }, function (err, response) {
        if (err) {
            res.json(null);
        } else {
            if (response.hits.hits.length > 0) {
                let hits = response.hits.hits[0];
                let source = hits._source;
                let codes = Object.keys(source);
                let process_item = 0;

                if (codes.length > 0) {
                    codes.forEach(function (code) {
                        let row = source[code];
                        client.search({
                            index: 'subs',
                            type: 'id',
                            body: {
                                query: {
                                    match: {
                                        _id: row.key
                                    }
                                }
                            }
                        }, function (err, response2) {
                            response.hits.hits[0]._source[code].sub_name = response2.hits.hits[0]._source.name;
                            process_item++;
                            if (process_item === codes.length) {
                                res.json(response);
                            }
                        });

                    });
                } else {
                    res.json(null);
                }
            } else {
                res.json(null);
            }
        }
    });
});

router.get('/get_subs_name', function (req, res, next) {
    let project = req.query.project;
    let input = req.query.input;
    client.search({
        index: 'subs',
        type: 'id',
        body: {
            size: 15,
            query: {
                bool: {
                    must: {
                        regexp: {
                            name: input + ".*"
                        }
                    }
                }
            },
            _source: ['name']
        }
    }, function (err, response) {
        if (err) {
            res.json(null);
        } else {
            if (response.hits.hits.length > 0) {
                let hits1 = response.hits.hits;
                let grab_ids = [];
                hits1.forEach(function (hit, ind, arr) {
                    grab_ids.push(hit._id);
                    if (ind === arr.length - 1) {
                        client.search({
                            index: 'reg_subs',
                            type: 'id',
                            body: {
                                query: {
                                    match: {
                                        _id: project
                                    }
                                },
                            }
                        }, function (err, response2) {
                            let hits = response2.hits.hits;
                            if (hits.length > 0) {
                                let source = hits[0]._source;
                                let keys = Object.keys(source);
                                let grabFields = [];
                                keys.forEach(function (key, ind, arr) {
                                    let item = source[key];
                                    let id_ind = grab_ids.indexOf(item.key);
                                    if (id_ind !== -1) {
                                        let sel_hit = hits1[id_ind];
                                        sel_hit._source['code'] = key;
                                        grabFields.push(sel_hit);
                                    }

                                    if (ind === arr.length - 1) {
                                        res.json(grabFields);
                                    }
                                });
                            } else {
                                res.json(null);
                            }
                        });
                    }
                });
            } else {
                res.json(null);
            }
        }
    });
});

router.post("/send_mail", function (req, res, next) {
    req.assert('email', 'Email is required!').notEmpty();
    req.getValidationResult().then(function (result) {
        var errors = result.useFirstErrorOnly().array();
        if (errors.length > 0) {
            return res.json({status: "failed", message: errors[0].msg});
        } else {
            usersRef.orderByChild('email').equalTo(req.body.email).once('value').then(function (userSnap) {
                let userData = userSnap.val();
                if (userData !== null) {
                    let keys = Object.keys(userData);
                    let sel_user = userData[keys[0]];
                    let randomStringPass = Math.random().toString(36).slice(-8);

                    if (sel_user.type === "admin") {
                        admin_firebase.auth().updateUser(keys[0], {
                            password: randomStringPass
                        }).then(function (userRecord) {
                            renderEmail(res, sel_user, randomStringPass, function (result) {
                                return res.json(result);
                            });
                        }).catch(function (err) {
                            console.log(err);
                            return res.json({status: "failed", message: "Firebase Auth Update Error!"});
                        });
                    } else {
                        let salt = bcrypt.genSaltSync(saltRounds);
                        let hashPass = bcrypt.hashSync(randomStringPass, salt);
                        usersRef.child(keys[0]).update({
                            password: hashPass
                        }, function (err) {
                            if (err) {
                                console.log(err);
                                return res.json({status: "failed", message: "Firebase Update Error!"});
                            }
                            renderEmail(res, sel_user, randomStringPass, function (result) {
                                return res.json(result);
                            });
                        });
                    }

                } else {
                    return res.json({status: "failed", message: "Invalid email!"});
                }
            });
        }
    });
});

router.post("/send_create_user_email", function (req, res, next) {
    req.assert('email', 'Email is required!').notEmpty();
    req.assert('password', 'Password is required!').notEmpty();
    req.assert('username', 'Username is required!').notEmpty();
    req.getValidationResult().then(function (result) {
        var errors = result.useFirstErrorOnly().array();
        if (errors.length > 0) {
            return res.json({status: "failed", message: errors[0].msg});
        } else {
            res.render("email_templates/create_user", {
                email: req.body.email,
                password: req.body.password,
                username: req.body.username
            }, function (errJade, html) {
                if (errJade) {
                    console.log(errJade);
                    return res.json({status: "failed", message: "Jade Error!"});
                }
                let mailOption = {
                    from: '"Finance Admin" <support@focusme360.com>',
                    to: req.body.email,
                    subject: 'New User',
                    html: html
                };
                transporter.sendMail(mailOption, function (err, info) {
                    if (err) {
                        console.log(err);
                        return res.json({status: "failed", message: "Error: Mail not send!"});
                    }
                    return res.json({status: "ok", info: info});
                });
            });
        }
    });
});

router.get("/search_dash", function (req, res, next) {
    let data = req.query;
    let search_param = {
        index: data.index,
        type: data.type,
        body: {
            size: 5,
            query: {
                // bool: {
                //     must: []
                // },
                /*match_phrase_prefix: {
                    query: data.search,
                    fields: ['agent_name'],
                    lenient: true
                }*/
                multi_match : {
                    fields : [],
                    query : data.search,
                    type : "phrase_prefix",
                    lenient: true
                }
            }
        }
    };

    if(data.field.indexOf(',') > -1){
        data.field.split(',').forEach(function (field) {
            search_param['body']['query']['multi_match']['fields'].push(field);
        });
    }else{
        search_param['body']['query']['multi_match']['fields'].push(data.field);
    }
    //[0]['match_phrase_prefix'][data.field] = data.search;
    client.search(search_param, function (err, result) {
        if (err) {
            return res.json(JSON.parse(err.response));
        }
        return res.json(result.hits.hits);
    });
});

module.exports = router;

function renderEmail(res, sel_user, newPass, callback) {
    res.render("email_templates/forgot_password", {
        name: sel_user.first_name,
        email: sel_user.email,
        password: newPass
    }, function (errJade, html) {
        if (errJade) {
            console.log(errJade);
            return callback({status: "failed", message: "Jade Error!"});
        }
        let mailOption = {
            from: '"Finance Admin" <support@focusme360.com>',
            to: sel_user.email,
            subject: 'Forgot Password!',
            html: html
        };
        transporter.sendMail(mailOption, function (err, info) {
            if (err) {
                console.log(err);
                return callback({status: "failed", message: "Error: Mail not send!"});
            }
            return callback({status: "ok", info: info});
        });
    });
}
