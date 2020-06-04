fetch-ndjson
------------

fetch-ndjson turns new line delimited JSON streaming responses retrieved using Fetch API into Generators that yield JSON.

## Install

```
npm i fetch-ndjson
```

## Usage

```
import ndjson from 'fetch-ndjson';

let res = await fetch(pathname);
let reader = res.body.getReader();
let gen = ndjson(reader);
while (true) {
  let { done, value } = await gen.next();
  console.log(`done=${done}, value=${JSON.stringify(value)}`);
  if (done) {
    return;
  }
}
```
