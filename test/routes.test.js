const request = require('supertest');
const config = require("../src/config.js");
const server = require("../src/server.js");



describe('routes', () => {
    it('should call / ', async(done)=>{

        try{

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

            let app = server.get();

            request(app)
            .get('/download/test.mp3')
            .expect(404)
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
    it('should call /tsv route with file attached', async(done)=>{

        try{
            jest.setTimeout(200000);
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