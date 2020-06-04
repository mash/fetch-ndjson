const debug = console.log;

// reader comes from:
// fetch('/api').then(response => response.body.getReader())
export default async function* gen(reader :ReadableStreamDefaultReader) :AsyncGenerator<any, string> {
  const matcher = /\r?\n/;
  const decoder = new TextDecoder();
  let buf = "";

  let next = reader.read();
  while (true) {
    let { done, value } = await next;

    if (done) {
      if (buf.length > 0) {
        yield JSON.parse(buf);
      }
      return;
    }

    let chunk = decoder.decode(value, {stream: true});
    debug(`chunk=${chunk}`);
    buf += chunk;

    const parts = buf.split(matcher);
    buf = parts.pop();
    for (let i = 0; i < parts.length; i++) {
      yield JSON.parse(parts[i]);
    }

    next = reader.read();
  }
}
