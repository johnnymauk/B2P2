const express = require('express');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const mysql = require('mysql');
const port = 3000;
const fs = require('file-system');
const clientSalt = fs.readFileSync('./security.txt', 'utf8');
const randomstring = require('randomstring');

const connection = mysql.createConnection({
    host: '10.0.3.2',
    user: 'bpapp',
    password: '[BPapp2020]',
    database: 'bpapp'
});


function returnToken(completed, id=0, token='', data = {}){
    return {completed: completed, token: {id: id, code: token}, data: data};
}

const app = express();


//here is the magic
app.use(cors());
app.use(express.urlencoded({extended: false}))
app.use(express.json({type:"*/*"}));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

function createToken(userid){
    const code = randomstring.generate(60);
    return new Promise( (resolve, reject) => {
        connection.query('INSERT INTO token SET ? , `created` = NOW();',{user_id: userid, code: code}, (err, result, field) => {
            if(err) throw err;
            resolve(code);
        });
    });
}
function readToken(userid, token){
    return new Promise((resolve, reject) => {
        connection.query('Select id from token where user_id=' + userid +
            ' and code="'+token +'" and created >= (NOW() - INTERVAL 15 MINUTE) LIMIT 1;', '', (err,result,field)=>{
            if(err) throw err;
            console.log(result);
            if(result.length > 0){
                resolve(true);
            }else{
                resolve(false);
            }
        });
    });
}
function updateToken(userid, token){
    const code = randomstring.generate(60);
    return new Promise((resolve, reject) => {
        connection.query('UPDATE token SET code="'+code+'", created=NOW() WHERE user_id=' + userid +
            ' and code="'+token +'" and created >= (NOW() - INTERVAL 15 MINUTE);', '', (err,result,field)=>{
            if(err) throw err;
            resolve(code);
        });
    });
}
function deleteTokens(){
    return new Promise( (resolve,reject) => {
        connection.query('DELETE FROM token WHERE created < ( NOW() - INTERVAL 15 MINUTE);', '', (err, result, field) => {
            if(err) throw err;
            resolve();
        });
    });
}

app.listen(port, () => {
    console.log(`B2P2 Backend is listening on port ${port}!`);
});

app.get('/', (req, res) => res.send('Hello World!'));

app.post('/auth',(req,res) => {
    res.send({salt: clientSalt});
});

app.post('/auth/create',(req,res) => {
    deleteTokens().then( () => {
        connection.query('Select id from user where email = ? LIMIT 1', req.body.email, (err, result, fields) => {
            if (err) throw err;
            console.log(result);
            if (result.length > 0) {
                res.send(returnToken(false));
            } else {
                const salt = bcrypt.genSaltSync(10);
                const hash = bcrypt.hashSync(req.body.password, salt);
                connection.query('INSERT INTO user SET ?', {
                    email: req.body.email,
                    hashedpassword: hash,
                    name: req.body.name
                }, (err2, result2, fields2) => {
                    if (err2) throw err2;
                    createToken(result2.insertId).then((code) => {
                        res.send(returnToken(true, result2.insertId,code));
                    });
                });
            }
        });
    });
});
app.post('/auth/read',(req,res) => {
    deleteTokens().then( () => {
        connection.query('Select id, hashedpassword from user where email=? LIMIT 1', req.body.email, (err, result, field) => {
            if (err) throw err;
            console.log(result);
            let flag = false;
            if (result.length > 0) {
                if (bcrypt.compareSync(req.body.password, result[0].hashedpassword)) {

                    connection.query('DELETE FROM token WHERE ?', {user_id: result[0].id}, (err2, result2, fields2)=>{
                        if(err2) throw err2;
                        createToken(result[0].id).then((code) => {
                            res.send(returnToken(true,result[0].id,code));
                        });
                    })
                } else {
                    flag = true;
                }
            } else {
                flag = true;
            }

            if (flag) {
                res.send(returnToken(false));
            }
        });
    });
});
app.post('/auth/update',(req,res) => {
    const id = req.body.id;
    const code = req.body.code;

    deleteTokens().then(()=>{
        readToken(id,code).then((valid) => {
            if(valid){
                updateToken(id,code).then((token)=>{
                    res.send(returnToken(true, id, token));
                });
            }else{
                res.send(returnToken(false));
            }
        });
    });
});
app.post('/auth/delete',(req,res) => {
    const id = req.body.id;
    const code = req.body.code;

    deleteTokens().then(()=>{
        readToken(id,code).then((valid)=>{
            if(valid){
                connection.query('DELETE FROM token WHERE ?', {user_id: id}, (err, result, fields) => {
                    if(err) throw err;
                    res.send(returnToken(true));
                });
            }else{
                res.send(returnToken(false));
            }
        });
    });
});

app.post('/user/read', (req, res) => {
    const userid = req.body.id;
    const code = req.body.code;

    deleteTokens().then(()=>{
        readToken(userid,code).then((valid) => {
            if(valid){
                connection.query('Select email, name FROM user WHERE ? LIMIT 1', {id: userid}, (err, result, fields)=>{
                    if(err) throw err;
                    updateToken(userid, code).then((token) => {
                        res.send(returnToken(true,userid, token, {email: result[0].email, name: result[0].name}));
                    });
                });
            }else{
                res.send(returnToken(false));
            }
        })

    });


});
app.post('/user/update', (req,res) => {
    const userid = req.body.id;
    const email = req.body.email;
    const name = req.body.name;
    const code = req.body.code;

    deleteTokens().then(() => {
        readToken(userid, code).then((valid) => {
            if(valid){
                connection.query('UPDATE user SET ? WHERE id='+userid+';',
                    {email: email, name: name}, (err, result, fields) => {
                        if(err) throw err;
                        updateToken(userid, code).then((token) => {
                            res.send(returnToken(true,userid, token));
                        });
                    });
            }else{
                res.send(returnToken(false));
            }
        });
    });
});
app.post('/user/delete', (req,res) => {
    const userid = req.body.id;
    const code = req.body.code;

    deleteTokens().then(()=>{
        readToken(userid,code).then((valid) => {
            if(valid){
                const delData = 'DELETE FROM bp WHERE user_id='+userid+'; ';
                const delToken = 'DELETE FROM token WHERE user_id='+userid+'; ';
                const delUser = 'DELETE FROM user WHERE id='+userid + '; ';

                connection.query(delData,'',(err, result, fields)=>{
                    if(err) throw err;
                    connection.query(delToken,'',(err, result, fields)=>{
                        if(err) throw err;
                        connection.query(delUser,'',(err,result,fields) =>{
                            if(err) throw err;
                            res.send(returnToken(true));
                        });
                    });
                });
            }else{
                res.send(returnToken(false));
            }
        })
    })
});

app.post('/user/data/create',(req,res) => {
    const userid = req.body.id;
    const pressure = req.body.pressure;
    const bpm = req.body.bpm;
    const code = req.body.code;
    const dtime = req.body.dtime;
    const note = req.body.note;

    deleteTokens().then(()=>{
        readToken(userid, code).then((valid)=>{
            if(valid){
                connection.query('INSERT INTO bp SET ?',
                    {user_id: userid, systolic: pressure.systolic, diastolic: pressure.diastolic, pulse: bpm, dtime: dtime, note: note},
                    (err,result,field)=>{
                        if(err) throw err;
                        updateToken(userid, code).then((token) => {
                            res.send(returnToken(true, userid, token));
                        })
                    });
            }else{
                res.send(returnToken(false));
            }
        });
    });

});
app.post('/user/data/read',(req,res) => {
    const userid = req.body.id;
    const code = req.body.code;
    deleteTokens().then( () => {
        readToken(userid, code).then( (valid) => {
            if(valid){
                connection.query(
                    "SELECT bp.id, bp.systolic, bp.diastolic, bp.pulse," +
                    "DATE_FORMAT(bp.dtime, '%Y-%m-%d %H:%i') as dtime" +
                    " FROM bp WHERE bp.user_id = ? ORDER BY dtime DESC LIMIT 100", userid, (err, result, field) => {
                        if(err) throw err;
                        updateToken(userid,code).then((token) => {
                            res.send(returnToken(true, userid, token, result));
                        });
                    });
            }else{
                res.send(returnToken(false));
            }
        });
    });
});

app.post('/user/data/read/entry',(req,res) => {
    const userid = req.body.id;
    const code = req.body.code;
    const bpid = req.body.bpid;

    deleteTokens().then( () => {
        readToken(userid, code).then( (valid) => {
            if(valid){
                connection.query(
                    "SELECT bp.id, bp.systolic, bp.diastolic, bp.pulse," +
                    "DATE_FORMAT(bp.dtime, '%Y-%m-%d %H:%i') as dtime, note" +
                    " FROM bp WHERE user_id="+userid+" AND id="+bpid+" LIMIT 1", {user_id: userid, id: bpid}, (err, result, field) => {
                        if(err) throw err;
                        updateToken(userid,code).then((token) => {
                            res.send(returnToken(true, userid, token, result));
                        });
                    });
            }else{
                res.send(returnToken(false));
            }
        });
    });
});


app.post('/user/data/update',(req,res) => {
    const userid = req.body.id;
    const pressure = req.body.pressure;
    const bpm = req.body.bpm;
    const code = req.body.code;
    const bpid = req.body.bpid;
    const dtime = req.body.dtime;
    const note = req.body.note;

    deleteTokens().then(()=>{
        readToken(userid, code).then((valid)=>{
            if(valid){
                connection.query('UPDATE bp SET ? WHERE user_id='+userid+' and id='+bpid+';',
                    {systolic: pressure.systolic, diastolic: pressure.diastolic, pulse: bpm, dtime: dtime, note: note},
                    (err,result,field)=>{
                        if(err) throw err;
                        updateToken(userid, code).then((token) => {
                            res.send(returnToken(true, userid, token));
                        });
                    });
            }else{
                res.send(returnToken(false));
            }
        });
    });
});
app.post('/user/data/delete',(req,res) => {
    const userid = req.body.id;
    const bpid = req.body.bpid;
    const code = req.body.code;

    deleteTokens().then(()=>{
        readToken(userid, code).then((valid)=>{
            if(valid){
                connection.query('DELETE FROM bp WHERE user_id='+userid+' and id='+bpid+';', '',
                    (err,result,field)=>{
                        if(err) throw err;
                        updateToken(userid, code).then((token) => {
                            res.send(returnToken(true, userid, token));
                        });
                    });
            }else{
                res.send(returnToken(false));
            }
        });
    });
});
