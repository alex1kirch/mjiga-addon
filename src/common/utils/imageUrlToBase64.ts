import fetch from 'node-fetch';

export default async function imageUrlToBase64(
  uri: string,
): Promise<string | null> {
  const res = await fetch(uri);
  let base64: string | null = null;

  if (res.ok) {
    let contentType = res.headers.get('Content-Type');
    if (contentType) {
      const typeRegRes = contentType.match(/image\/\w+/);
      if (typeRegRes) {
        contentType = typeRegRes[0];
        const resBuffer = await res.buffer();
        base64 = `data:${contentType};base64,${resBuffer.toString('base64')}`;
      }
    }
  }

  return base64;
}
