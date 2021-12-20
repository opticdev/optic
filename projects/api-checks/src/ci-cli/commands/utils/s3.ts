import fetch from 'node-fetch';

export const uploadFileToS3 = async (signedUrl: string, file: Buffer) => {
  await fetch(signedUrl, {
    method: 'PUT',
    headers: {
      'x-amz-server-side-encryption': 'AES256',
    },
    body: file,
  });
};
