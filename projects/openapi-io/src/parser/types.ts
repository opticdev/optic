export type ExternalRefHandler = {
  order: number;
  canRead: (file: { url: string }) => boolean;
  read: (file: { url: string }) => Promise<string>;
};
