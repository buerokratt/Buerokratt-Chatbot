import { describe, expect, it } from 'vitest';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const config = require('./config.js');

describe('config', () => {
  it('should export openSearchConfig with required properties', () => {
    expect(config.openSearchConfig).toBeDefined();
    expect(config.openSearchConfig.notificationIndex).toBe('notifications');
    expect(config.openSearchConfig.chatQueueIndex).toBe('chatqueue');
    expect(config.openSearchConfig.ssl).toBeDefined();
    expect(config.openSearchConfig.ssl.rejectUnauthorized).toBe(false);
  });

  it('should export serverConfig with required properties', () => {
    expect(config.serverConfig).toBeDefined();
    expect(config.serverConfig.port).toBeDefined();
    expect(config.serverConfig.refreshInterval).toBeDefined();
    expect(config.serverConfig.queueRefreshInterval).toBeDefined();
  });

  it('should have getUrl function that returns a valid URL string', () => {
    expect(config.openSearchConfig.getUrl).toBeDefined();
    expect(typeof config.openSearchConfig.getUrl).toBe('function');

    const url = config.openSearchConfig.getUrl();
    expect(typeof url).toBe('string');
    expect(url).toMatch(/^https?:\/\//);
  });

  it('should have retry_on_conflict set to 6', () => {
    expect(config.openSearchConfig.retry_on_conflict).toBe(6);
  });
});
