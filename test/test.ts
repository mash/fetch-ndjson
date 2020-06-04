import ndjson from '../src/index';

async function runtest(pathname) {
  console.log(`pathname=${pathname}`);
  let res = await fetch(pathname);

  // ndjson user should take care of unexpected responses
  if ((res.headers.get('Content-Type') !== 'application/x-ndjson') ||
      (res.status !== 200)) {
    console.log(`Content-Type=${res.headers.get('Content-Type')}`);
    console.log(`res.status=${res.status}`);
    return;
  }
  let reader = res.body.getReader();
  let gen = ndjson(reader);
  while (true) {
    let { done, value } = await gen.next();
    console.log(`done=${done}, value=${JSON.stringify(value)}`);
    if (done) {
      return;
    }
  }
}

(async function () {
  let pathname = location.hash.substr(1);
  runtest(pathname);
})();

window.onhashchange = function () {
  (async function () {
    let pathname = location.hash.substr(1);
    runtest(pathname);
  })();
};
