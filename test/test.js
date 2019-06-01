
describe('routes', () => {

  it('test system working', () => {
    expect(1).toBe(1);
  });

  it('expect with object', () => {
    let a = undefined;
    let b = null;
    let c = { "dateTime": "2019-05-31T16:19:42.998Z", "id": "20cc31e4-2704-420d-bca4-90deec507049", "ver": "0.1", "status": null, "statusCode": 200, "downloadURI": "http://localhost:3005/download/20cc31e4-2704-420d-bca4-90deec507049.mp3" };
    let d = '';


    expect(a).not.toBeTruthy();
    expect(b).not.toBeTruthy();
    expect(d).not.toBeTruthy();

    const downloadURL = c.downloadURI;

    expect(c).toBeTruthy();

    const regex = new RegExp(/(http.\/\/.*\/download)\/(.*mp3)/);
    expect(downloadURL).toMatch(regex);
  });
});