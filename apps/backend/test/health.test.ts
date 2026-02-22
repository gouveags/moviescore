import app from '../src/index';

describe('GET /health', () => {
  it('returns service health payload', async () => {
    const response = await app.request('/health');

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      status: 'ok',
      service: 'moviescore-api'
    });
  });
});
