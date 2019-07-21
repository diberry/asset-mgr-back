const request = require('supertest'),
    fs = require("fs").promises;


const config = require("../src/config.js");
const server = require("../src/server.js");
const string = require("../src/strings.js");

const Token = require('../src/token.js');

describe('routes', () => {
    describe('user routes', () => {
        it('should create new User', async(done)=>{

            try{
                jest.setTimeout(900000);
                let timestamp = string.dateAsTimestamp();
                let app = server.get();

                let user = "dina" + timestamp + "@email.com";
                let pwd = "dina-password-" + timestamp;
    
                // create user - also creates hash
                request(app)
                .post('/user/create')
                .set('Content-type', 'application/json')
                .send({username: user, password: pwd })
                .expect(200)
                .end((err, res)=>{
                    if (err) return done(err);
        
                    expect(res.body.success).toEqual(true);
        
                    // login user - returns token
                    request(app)
                    .post('/login')
                    .set('Content-type', 'application/json')
                    .send({username: user, password: pwd})
                    .expect(200)
                    .end(async (err, res)=>{
                        if (err) return done(err);
            
                        expect(res.body.success).toEqual(true);
                        expect(res.body.token).not.toBe(undefined);
                        
                        console.log(res.body.token);

                        //decode token to figure out if user email 
                        const testConfig = config.getConfigTest();
                        const token = new Token(testConfig.secret);
                        const decodedToken = await token.verifyTokenAsync(res.body.token);

                        expect(decodedToken.user.user).toEqual(user);

                        // validate only authenticated user can get route 
                        request(app)
                        .post('/user/auth-test')
                        .set('Content-type','application/json')
                        .set('Authorization', 'Bearer ' + res.body.token)
                        .send({"a":"b"})
                        .expect(200)
                        .end((err,res) => {

                            if (err) return done(err);
                            expect(res.body.status).toEqual(`authenticated ${decodedToken.user.user}`);

                            request(app)
                            .post('/user/auth-test')
                            .set('Content-type','application/json')
                            .send({"a":"b"})
                            .expect(401)
                            .end((err,res) => {
                                if (err) return done(err);
                                expect(res.statusCode).toEqual(401);
                                done();
                            })

                        })

                    });
                });
    
            } catch(err){
                done(`err = ${JSON.stringify(err)}`);
            }

        });

    })

    it('should call / ', async(done)=>{

        try{
            jest.setTimeout(25000);
            let app = server.get();

            request(app)
            .get('/')
            .expect(200)
            .end((err, res)=>{
                if (err) return done(err);
    
                //console.log("res=", res.body);
    
                done();
            });

        } catch(err){
            done(`err = ${JSON.stringify(err)}`);
        }

    });
    it('should call /status route', async(done)=>{

        try{
            jest.setTimeout(25000);
            let app = server.get();

            request(app)
            .get('/status')
            .expect(200)
            .end((err, res)=>{
                if (err) return done(err);
    
                //console.log("res=", res.body);
    
                done();
            });

        } catch(err){
            done(`err = ${JSON.stringify(err)}`);
        }

    });
    it('should call /config route', async(done)=>{

        try{
            jest.setTimeout(25000);
            let app = server.get();

            request(app)
            .get('/config')
            .expect(200)
            .end((err, res)=>{
                if (err) return done(err);
    
                //console.log("res=", res.body);
    
                done();
            });

        } catch(err){
            done(`err = ${JSON.stringify(err)}`);
        }

    });
    it('should call /config/speech route', async(done)=>{

        try{
            jest.setTimeout(25000);
            let app = server.get();

            request(app)
            .get('/config/speech')
            .expect(200)
            .end((err, res)=>{
                if (err) return done(err);
    
                //console.log("res=", res.body);
    
                done();
            });

        } catch(err){
            done(`err = ${JSON.stringify(err)}`);
        }

    });
    it('should call /error route', async(done)=>{

        try{

            let app = server.get();

            jest.setTimeout(25000);

            request(app)
            .get('/error')
            .expect(500)
            .end((err, res)=>{
                if (err) return done(err);
    
                //console.log("res=", res.body);
    
                done();
            });

        } catch(err){
            done(`err = ${JSON.stringify(err)}`);
        }

    });
    it('should call /download/:id route with invalid id', async(done)=>{

        try{
            jest.setTimeout(25000);
            let app = server.get();

            request(app)
            .get('/download/test.mp3')
            .expect(404)
            .end((err, res)=>{
                if (err) return done(err);
    
                done();
            });

        } catch(err){
            done(`err = ${JSON.stringify(err)}`);
        }

    });
    it('should call /download/:id route with valid id', async(done)=>{

        try{
            jest.setTimeout(25000);
            const fileName = "01c15845-a6b4-4b68-8614-5b45f3d4eb36.mp3";
            let testConfig = config.getConfigTest();
            let app = server.get(testConfig);


            //const newFileName = string.dateAsTimestamp();
            const originPath = path.join(testConfig.rootDir, `/data/old-mp3/${fileName}`);
            const destinationPath = path.join(testConfig.rootDir, `/out/${fileName}`);

            // copy file
            await fs.copyFile(originPath,destinationPath);

            request(app)
            .get(`/download/${fileName}`)
            .expect(200)
            .end((err, res)=>{
                if (err) return done(err);
    
                //console.log("res=", res.body);
    
                done();
            });

        } catch(err){
            done(`err = ${JSON.stringify(err)}`);
        }

    });    
    it('should call /mp3 route with text on body', async(done)=>{

        try{
            jest.setTimeout(25000);
            let testConfig = config.getConfigTest();
            let app = server.get(testConfig);

            request(app)
            .post('/mp3')
            .set('Content-type', 'application/json')
            .send({rawtext:"this is a test"})
            //.attach('file', '../data/short.txt')
            .expect(200)
            .end((err, res)=>{
                if (err) {
                    //console.log(JSON.stringify(err));
                    return done(err);
                }
    
                const regex = new RegExp(/(http.\/\/.*\/download)\/(.*mp3)/);
                expect(res.body.downloadURI).toMatch(regex);
    
                done();
            });

        } catch(err){
            //console.log(JSON.stringify(err));
            done(`err = ${JSON.stringify(err)}`);
        }

    });
    it('should call /upload route with attached text file', async(done)=>{

        try{
            jest.setTimeout(25000);
            let testConfig = config.getConfigTest();
            let app = server.get(testConfig);

            let file = path.join(testConfig.rootDir, '/data/short.txt');


            request(app)
            .post('/upload')
            .set('Content-type', 'text/plain')
            .attach('fileToConvert', file)
            .expect(200)
            .end((err, res)=>{
                if (err) return done(err);
    
                const regex = new RegExp(/(http.\/\/.*\/download)\/(.*mp3)/);
                expect(res.body.downloadURI).toMatch(regex);
    
                done();
            });

        } catch(err){
            done(`err = ${JSON.stringify(err)}`);
        }

    });    
    it('should call /json-array route without array in body of JSON', async(done)=>{

        try{
            jest.setTimeout(25000);
            let testConfig = config.getConfigTest();
            let app = server.get(testConfig);

            request(app)
            .post('/json-array')
            .set('Accept', 'application/json')
            .send({"json-array":"this is a test"})
            .expect('Content-Type', /json/)
            .expect(400)
            .end((err, res)=>{
                if (err) return done("didn't expect error");
    
                expect(res.statusCode).toEqual(400);
                expect(res.body.error).toEqual("empty params");

                done();
            });

        } catch(err){
            done(`err = ${JSON.stringify(err)}`);
        }

    });    
    it('should call /json-array route with array in body of JSON', async(done)=>{

        try{
            jest.setTimeout(200000);
            let testConfig = config.getConfigTest();
            let app = server.get(testConfig);

            request(app)
            .post('/json-array')
            .set('Accept', 'application/json')
            .send({"json-array":[
                "this is a test",
                "that was a test",
                "here is another test"
            ]})
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
   
                expect(res.body.results.length).toEqual(3);
                const regex = new RegExp(/(http.\/\/.*\/download)\/(.*mp3)/);
                expect(res.body.results[0].downloadURI).toMatch(regex);


                done();
            });

        } catch(err){
            done(`err = ${JSON.stringify(err)}`);
        }

    });     
    // TBD: this always gets a socket error
    xit('should call /tsv route with file attached', async(done)=>{

        try{
            jest.setTimeout(900000);
            let testConfig = config.getConfigTest();
            let app = server.get(testConfig);

            let tsvfile = path.join(testConfig.rootDir, '/data/kb.tsv');

            request(app)
            .post('/tsv')
            .set('Content-type', 'text/tab-separated-values')
            .set('Accept', 'application/json')
            .attach('fileToConvert', tsvfile)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
   
                expect(res.body.results.length).toEqual(79);
                const regex = new RegExp(/(http.\/\/.*\/download)\/(.*mp3)/);
                expect(res.body.results[0].downloadURI).toMatch(regex);


                done();
            });

        } catch(err){
            done(`err = ${JSON.stringify(err)}`);
        }

    });  
});