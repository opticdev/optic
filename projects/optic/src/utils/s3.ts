import fetch from 'node-fetch';

export const uploadFileToS3 = async (
  signedUrl: string,
  file: string | Buffer,
  additionalHeaders: Record<string, string> = {}
) => {
  await fetch(signedUrl, {
    method: 'PUT',
    headers: {
      ...additionalHeaders,
      'x-amz-server-side-encryption': 'AES256',
    },
    body: file,
  }).then(async (response) => {
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`${response.status} ${response.statusText} \n${text}`);
    }
  });
};
