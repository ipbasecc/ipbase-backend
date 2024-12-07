const axios = require('axios').default;
const crypto = require('crypto');

module.exports = {
  // 加密密码
  encryptPassword(password) {
    if (!password) {
      throw new Error('Password is required for encryption');
    }

    if (!process.env.MM_PASSWORD_KEY) {
      throw new Error('MM_PASSWORD_KEY environment variable is not set');
    }

    try {
      const algorithm = 'aes-256-cbc';
      // 确保密钥长度正确（32字节）
      const key = crypto.scryptSync(process.env.MM_PASSWORD_KEY, 'salt', 32);
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(algorithm, key, iv);

      let encrypted = cipher.update(password, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt password');
    }
  },

  // 解密密码
  decryptPassword(encryptedData) {
    if (!encryptedData) {
      throw new Error('Encrypted data is required for decryption');
    }

    if (!process.env.MM_PASSWORD_KEY) {
      throw new Error('MM_PASSWORD_KEY environment variable is not set');
    }

    try {
      const algorithm = 'aes-256-cbc';
      // 确保密钥长度正确（32字节）
      const key = crypto.scryptSync(process.env.MM_PASSWORD_KEY, 'salt', 32);
      const [ivHex, encryptedHex] = encryptedData.split(':');
      const iv = Buffer.from(ivHex, 'hex');
      const decipher = crypto.createDecipheriv(algorithm, key, iv);

      let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt password');
    }
  },

  // 生成强密码
  generateStrongPassword(seed) {
    try {
      const length = 16;
      const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
      let password = '';

      if (seed) {
        // 使用 seed 生成确定性的随机密码
        const hash = crypto.createHash('sha256').update(seed).digest();
        for (let i = 0; i < length; i++) {
          // 使用 hash 的每个字节来确定字符集中的索引
          const randomIndex = hash[i % hash.length] % charset.length;
          password += charset[randomIndex];
        }
      } else {
        // 保持原有的随机密码生成逻辑
        for (let i = 0; i < length; i++) {
          const randomIndex = crypto.randomInt(0, charset.length);
          password += charset[randomIndex];
        }
      }

      // 确保密码包含至少一个大写字母、一个小写字母、一个数字和一个特殊字符
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSpecial = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password);

      if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecial) {
        // 如果缺少任何必需的字符类型，递归重新生成
        return this.generateStrongPassword(seed);
      }

      return password;
    } catch (error) {
      console.error('Password generation error:', error);
      throw new Error('Failed to generate password');
    }
  },

  // 获取 Mattermost token
  async getMattermostToken(email, password) {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    try {
        const mmapi = strapi.plugin('mattermost').service('mmapi');
        const params = {
          login_id: email,
          password: password
        }
        const loginResponse = await mmapi.login(params);

      const token = loginResponse.headers.token;
      if (!token) {
        throw new Error('No token received from Mattermost');
      }

      return {
        id: loginResponse.data.id,
        username: loginResponse.data.username,
        email: loginResponse.data.email,
        token: token
      };
    } catch (error) {
      console.error('Mattermost token error:', error.response?.data || error.message);
      throw new Error('Failed to get Mattermost token');
    }
  }
};
