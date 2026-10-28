
const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');

const { authenticateToken } = require('./../../middleware/authMiddleware');

const TEST_SECRET = 'testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttest';
const originalSecret = process.env.JWT_SECRET;

function createResponse() {
  return {
    statusCode: null,
    body: null,

    status(code) {
      this.statusCode = code;
      return this;
    },

    json(body) {
      this.body = body;
      return this;
    },
  };
}

function createRequest(authorization) {
  return {
    headers: authorization
      ? { authorization }
      : {},
  };
}

describe('authenticateToken middleware', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = TEST_SECRET;
  });

  it('returns 401 when the Authorization header is missing', () => {
    const req = createRequest();
    const res = createResponse();
    let nextCalled = false;

    authenticateToken(req, res, () => {
      nextCalled = true;
    });

    assert.equal(res.statusCode, 401);
    assert.equal(nextCalled, false);
  });

  it('returns 401 for an invalid JWT', () => {
    const req = createRequest('Bearer invalid-token');
    const res = createResponse();
    let nextCalled = false;

    authenticateToken(req, res, () => {
      nextCalled = true;
    });

    assert.equal(res.statusCode, 401);
    assert.equal(nextCalled, false);
  });

  it('accepts a valid JWT and populates req.user', () => {
    const token = jwt.sign(
      { userId: 42, username: 'unit_test_user' },
      TEST_SECRET,
      { expiresIn: '5m' }
    );

    const req = createRequest(`Bearer ${token}`);
    const res = createResponse();
    let nextCalled = false;

    authenticateToken(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, true);
    assert.deepEqual(req.user, {
      userId: 42,
      username: 'unit_test_user',
    });
    assert.equal(res.statusCode, null);
  });

  it('returns 401 for an expired JWT', () => {
    const token = jwt.sign(
      { userId: 42, username: 'unit_test_user' },
      TEST_SECRET,
      { expiresIn: -1 }
    );

    const req = createRequest(`Bearer ${token}`);
    const res = createResponse();
    let nextCalled = false;

    authenticateToken(req, res, () => {
      nextCalled = true;
    });

    assert.equal(res.statusCode, 401);
    assert.equal(nextCalled, false);
  });
});

process.on('exit', () => {
  if (originalSecret === undefined) {
    delete process.env.JWT_SECRET;
  } else {
    process.env.JWT_SECRET = originalSecret;
  }
});
