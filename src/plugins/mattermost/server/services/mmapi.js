'use strict';

/**
 * project service
 */

const axios = require('axios').default;
const mmapi = axios.create({
    baseURL: process.env.MM_API || 'https://chat.yihu.team/api/v4/'
})
mmapi.interceptors.request.use((config) => {
    config.headers.Authorization = `Bearer ${process.env.MM_MASTER_TOKEN}`;
    config.headers['Content-Type'] = 'application/json';
    return config;
});

module.exports = ({ strapi }) => ({
  // http://your-mattermost-url.com/api/v4/users
  // https://api.mattermost.com/#tag/users/operation/CreateUser
  // {
  //   "email": `"string",       ***
  //   "username": "string",     ***
  //   "first_name": "string",
  //   "last_name": "string",
  //   "nickname": "string",
  //   "auth_data": "string",
  //   "auth_service": "string",
  //   "password": "string",     ***
  //   "locale": "string",
  //   "props": {},
  //   "notify_props": {
  //     "email": "string",
  //     "push": "string",
  //     "desktop": "string",
  //     "desktop_sound": "string",
  //     "mention_keys": "string",
  //     "channel": "string",
  //     "first_name": "string"
  //   }
  // }
  createUser: async (params) => {
    try {
      return await mmapi.post(`users`,params);
    } catch (error) {
    //   console.error(error.response?.data);
      throw(409, error.response?.data)
    }
  },
  // https://your-mattermost-url.com/api/v4/users/login
  login: async (params) => {
    try {
      return await mmapi.post(`users/login`,params);
    } catch (error) {
    //   console.error(error.response?.data);
      throw(409, error.response?.data)
    }
  },
  // http://your-mattermost-url.com/api/v4/users/email/{email}
  findUserByEmail: async (email) => {
    try {
      return await mmapi.get(`users/email/${email}`);
    } catch (error) {
    //   console.error(error.response?.data);
      throw(409, error.response?.data)
    }
  },
  // http://your-mattermost-url.com/api/v4/users/{user_id}
  /**
   * params {
       id: 
       email:
       username:
   }
   * **/
  updateUser: async (user_id, params) => {
    try {
      return await mmapi.put(`users/${user_id}`, params);
    } catch (error) {
    //   console.error(error.response?.data);
      throw(409, error.response?.data)
    }
  },
  // https://your-mattermost-url.com/api/v4/users/{user_id}/password
  changeUserPassword: async (user_id,params) => {
    try {
      return await mmapi.put(`users/${user_id}/password`,params);
    } catch (error) {
      console.error(error.response?.data);
    }
  },
  // Patch a team
  //https://api.mattermost.com/#tag/teams/operation/PatchTeam
  // https://your-mattermost-url.com/api/v4/teams/{team_id}/patch
  // {
  //   "display_name": "string",
  //   "description": "string",
  //   "company_name": "string",
  //   "invite_id": "string",
  //   "allow_open_invite": true
  // }
  PathTeam: async (team_id,params) => {
    try {
        return await mmapi.put(`teams/${team_id}/patch`,params);
    } catch (error) {
        console.error(error.response?.data);
    }
  },
  //https://your-mattermost-url.com/api/v4/channels/{channel_id}/patch
  PathChannel: async (channel_id,params) => {
    try {
        return await mmapi.put(`channels/${channel_id}/patch`,params);
    } catch (error) {
        console.error(error.response?.data);
    }
  },
  RemoveUserFromChannel: async (channel_id,user_id) => {
    // console.log('RemoveUserFromChannel');
    // return 'OK'
      try {
          return await mmapi.delete(`channels/${channel_id}/members/${user_id}`);
      } catch (error) {
          console.error(error.response?.data);
      }
  },
  RemoveUserFromTeam: async (team_id,user_id) => {
    // return 'OK';
      try {
          return await mmapi.delete(`teams/${team_id}/members/${user_id}`);
      } catch (error) {
          console.error(error.response?.data);
      }
  },
  addMemberToChannel: async (channel_id,params) => {
    // return 'OK'
      try {
          return await mmapi.post(`channels/${channel_id}/members`,params);
      } catch (error) {
          console.error(error.data);
      }
  },
  addMemberToTeam: async (team_id,params) => {
    // return 'OK'
      try {
          return await mmapi.post(`teams/${team_id}/members`,params);
      } catch (error) {
          console.error(error.data);
      }
  },
  getTeamMember: async (team_id,user_id) => {
    // return 'OK'
    // 如���返回 res.data.status_code === 404 , 说明成员不在此团队
      try {
          return await mmapi.get(`teams/${team_id}/members/${user_id}`);
      } catch (error) {
          console.error(error.response?.data);
      }
  },
  getChannelMember: async (channel_id,user_id) => {
    // return 'OK'
    // 如果返回 res.data.status_code === 404 , 说明成员不在此频道
      try {
          return await mmapi.get(`channels/${channel_id}/members/${user_id}`);
      } catch (error) {
          console.error(error.response?.data);
      }
  },
  updateChannel: async(channel_id,params) => {
    // {
    //   "id": "string",
    //   "name": "string",
    //   "display_name": "string",
    //   "purpose": "string",
    //   "header": "string"
    // }
    try {
        const res = await mmapi.put(`/channels/${channel_id}`,params);
        if(res) {
          return res
        }
    } catch (error) {
        return error
    }
  },
  // Update channel's privacy
  // http://your-mattermost-url.com/api/v4/channels/{channel_id}/privacy
  updateChannelPrivacy: async(channel_id,privacy) => {
    try {
        const res = await mmapi.put(`/channels/${channel_id}/privacy`,privacy);
        if(res) {
          return res
        }
    } catch (error) {
        return error
    }
  },
  deleteChannel: async(channel_id) => {
    try {
        const res = await mmapi.delete(`/channels/${channel_id}`);
        if(res) {
          return res
        }
    } catch (error) {
        return error
    }
  },
  // http://your-mattermost-url.com/api/v4/channels/{channel_id}/restore
  restoreChannel: async(channel_id) => {
    try {
        const res = await mmapi.post(`/channels/${channel_id}/restore`);
        if(res) {
          return res
        }
    } catch (error) {
        return error
    }
  },
  createPost: async (params) => {
    // {
    //   "channel_id": "string",
    //   "message": "string",
    //   "root_id": "string",
    //   "file_ids": [
    //     "string"
    //   ],
    //   "props": {},
    //   "metadata": {
    //     "priority": {
    //       "priority": "string",
    //       "requested_ack": true
    //     }
    //   }
    // }
    // return 'OK'
    // 如果返回 res.data.status_code === 404 , 说明成员不在此频道
      try {
          return await mmapi.post(`posts`,params);
      } catch (error) {
          console.error(error.response?.data);
      }
  },
  getPost: async (post_id) => {
    try {
      return await mmapi.get(`posts/${post_id}`,);
    } catch (error) {
      console.error(error.response?.data);
    }
  },
  getThread: async (post_id) => {
    try {
      return await mmapi.get(`posts/${post_id}/thread`);
    } catch (error) {
      console.error(error.response?.data);
    }
  },
  deleteTeam: async (team_id) => {
    try {
      return await mmapi.delete(`teams/${team_id}`);
    } catch (error) {
      console.error(error.response?.data);
    }
  },
  createGroup: async (groupInfo, users) => {
      // https://api.mattermost.com/#tag/groups/operation/CreateGroup
      // POST
    // {
    //     "group": {
    //         "name": "string",
    //         "display_name": "string",
    //         "source": "string",
    //         "allow_reference": true
    //     },
    //     "user_ids": [
    //         "string"
    //     ]
    // }
    const params = {
        group: groupInfo,
        user_ids: users
    }
    try {
      return await mmapi.post(`groups`,params);
    } catch (error) {
      console.error(error.response?.data);
    }
  },
  addToGroup: async (group_id,users) => {
      // https://api.mattermost.com/#tag/groups/operation/AddGroupMembers
      // POST
        // {
        //   "user_ids": [
        //     "string"
        //   ]
        // }
    const params = {
        user_ids: users
    }
    try {
      return await mmapi.post(`groups/${group_id}/members`,params);
    } catch (error) {
      console.error(error.response?.data);
    }
  },
  async deleteUser(userId) {
    try {
        // 1. 首先获取用户信息
        const userInfo = await mmapi.get(`/users/${userId}`);
        const user = userInfo.data;

        // 2. 修改用户信息，添加 _removed 后缀
        const timestamp = Date.now();
        const updateResponse = await mmapi.put(
            `/users/${userId}/patch`,
            {
                email: `${user.email.split('@')[0]}_removed_${timestamp}@${user.email.split('@')[1]}`,
                username: `${user.username}_removed_${timestamp}`,
                nickname: user.nickname ? `${user.nickname}_removed` : undefined
            }
        );

        // 3. 禁用用户
        const deactivateResponse = await mmapi.delete(`/users/${userId}`);

        console.log(`Successfully processed Mattermost user ${userId}:`, {
            originalEmail: user.email,
            newEmail: updateResponse.data.email,
            originalUsername: user.username,
            newUsername: updateResponse.data.username,
            status: 'deactivated'
        });

        return {
            status: 'success',
            originalUser: user,
            updatedUser: updateResponse.data,
            deactivated: true
        };
    } catch (error) {
        console.error('Failed to process Mattermost user:', {
            userId,
            error: error.response?.data || error.message,
            status: error.response?.status
        });
        throw error;
    }
  },
  updateUserPassword: async(userId, newPassword) => {
    try {
        const response = await mmapi.put(
            `users/${userId}/password`,
            {
                new_password: newPassword,
                // 使用管理员token时不需要提供旧密码
            }
        );
        return response;
    } catch (error) {
        console.error('Failed to update user password:', error.response?.data || error);
        throw error;
    }
  },
});
