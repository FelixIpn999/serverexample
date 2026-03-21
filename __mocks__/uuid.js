const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

module.exports = {
  v4: jest.fn(() => '123e4567-e89b-12d3-a456-426614174000'),
  validate: jest.fn((value) => UUID_V4_REGEX.test(String(value))),
};
