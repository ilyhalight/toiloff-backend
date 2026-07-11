const UUID_V7_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const isUUIDv7 = (value: string | undefined): boolean => {
  if (!value) {
    return false;
  }

  return UUID_V7_REGEX.test(value);
};
