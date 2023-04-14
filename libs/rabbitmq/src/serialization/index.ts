export const serializeMessage = (message: Object) => {
  return Buffer.from(JSON.stringify(message), 'utf8');
};

export const deserializeMessage = (buffer: Buffer, msg: any) => {
  return JSON.parse(buffer.toString('utf8'));
};
