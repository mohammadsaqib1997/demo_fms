var admin_firebase = require("firebase-admin");
var serviceAccount = require("../config/serviceAccountKey.json");
var config_fireBase = require("../config/private.json");
admin_firebase.initializeApp({
    credential: admin_firebase.credential.cert(serviceAccount),
    databaseURL: config_fireBase.config_fb.databaseURL
});

var db = admin_firebase.database();
var regSubsRef = db.ref('reg_subsidiary');
var subsRef = db.ref('subsidiary');
var partyInfoRef = db.ref('party_information');
var masterDetailsRef = db.ref('master_details');
var vouchersRef = db.ref('vouchers');

var elasticSearch = require('elasticsearch');
var client = elasticSearch.Client({
    host: 'localhost:9200',
    log:'trace'
});


regSubsRef.on("child_added", function (snap) {
    createOrUpdateIndex(snap, 'reg_subs', 'id');
});
regSubsRef.on("child_changed", function (snap) {
    createOrUpdateIndex(snap, 'reg_subs', 'id');
});
regSubsRef.on("child_removed", function (snap) {
    removeIndex(snap, 'reg_subs', 'id');
});

subsRef.on("child_added", function (snap) {
    createOrUpdateIndex(snap, 'subs', 'id');
});
subsRef.on("child_changed", function (snap) {
    createOrUpdateIndex(snap, 'subs', 'id');
});
subsRef.on("child_removed", function (snap) {
    removeIndex(snap, 'subs', 'id');
});

partyInfoRef.on("child_added", function (snap) {
    createOrUpdateIndex(snap, 'party_info', 'id');
});
partyInfoRef.on("child_changed", function (snap) {
    createOrUpdateIndex(snap, 'party_info', 'id');
});
partyInfoRef.on("child_removed", function (snap) {
    removeIndex(snap, 'party_info', 'id');
});

masterDetailsRef.on("child_added", function (snap) {
    createOrUpdateIndex(snap, 'master_detail', 'id');
});
masterDetailsRef.on("child_changed", function (snap) {
    createOrUpdateIndex(snap, 'master_detail', 'id');
});
masterDetailsRef.on("child_removed", function (snap) {
    removeIndex(snap, 'master_detail', 'id');
});

vouchersRef.on("child_added", function (snap) {
    createOrUpdateIndex(snap, 'voucher', 'id');
});
vouchersRef.on("child_changed", function (snap) {
    createOrUpdateIndex(snap, 'voucher', 'id');
});
vouchersRef.on("child_removed", function (snap) {
    removeIndex(snap, 'voucher', 'id');
});


function createOrUpdateIndex(snap, ref, type) {
    client.index({
        index: ref,
        type: type,
        id: snap.key,
        body: snap.val()
    }, function (err, res) {
        if(err){
            console.log(err);
        }
    });
}

function removeIndex(snap, ref, type) {
    client.delete({
        index: ref,
        type: type,
        id: snap.key
    }, function (error, response) {
        if(error){
            console.log(error);
        }
    });
}