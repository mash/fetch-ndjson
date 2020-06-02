import ndjson from '../src/index';

(async function () {
  console.log('before fetch /api');
  let res = await fetch('/api');
  let reader = res.body.getReader();
  let gen = ndjson(reader);
  while (true) {
    let { done, value } = await gen.next();
    console.log(`done=${done}, value=${value}`);
    if (done) {
      return;
    }
  }
})();
