import { createRedisConnection } from './config/redis.js';

const testConnection = async () => {
  console.log('Testing Upstash Redis connection...');
  
  const redis = createRedisConnection(false);
  
  try {
    // Test ping
    const pong = await redis.ping();
    console.log('✓ PING:', pong);
    
    // Test set/get
    await redis.set('test-key', 'Hello Upstash!');
    const value = await redis.get('test-key');
    console.log('✓ GET test-key:', value);
    
    // Clean up
    await redis.del('test-key');
    console.log('✓ Connection test successful!');
    
    await redis.quit();
    process.exit(0);
  } catch (error) {
    console.error('✗ Connection failed:', error.message);
    process.exit(1);
  }
};

testConnection();
