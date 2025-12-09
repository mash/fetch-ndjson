// const debug = console.log;

// reader comes from:
// fetch('/api').then(response => response.body.getReader())
export default async function* gen(reader: ReadableStreamDefaultReader): AsyncGenerator<any, void> {
  const matcher = /\r?\n/;
  const decoder = new TextDecoder();
  let buf = '';

  let next = reader.read();
  while (true) {
    const { done, value } = await next;

    if (done) {
      if (buf.length > 0) {
        yield JSON.parse(buf);
      }
      return;
    }

    const chunk = decoder.decode(value, { stream: true });
    // debug(`chunk=${chunk}`);
    buf += chunk;

    const parts = buf.split(matcher);
    buf = parts.pop();
    for (const i of parts) {
      if (!i.match(/^\s*$/)) {
        yield JSON.parse(i);
      }
    }

    next = reader.read();
  }
}
