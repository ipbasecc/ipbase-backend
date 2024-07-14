'use strict';

/**
 * project service
 */

const axios = require('axios').default;
const mmapi = axios.create({ 
    baseURL: process.env.MM_API || 'https://mattermost.yihu.team/api/v4/'
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
      console.error(error);
    }
  },
  // https://your-mattermost-url.com/api/v4/users/{user_id}/password
  changeUserPassword: async (user_id,params) => {
    try {
      return await mmapi.put(`users/${user_id}/password`,params);
    } catch (error) {
      console.error(error);
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
        console.error(error);
    }
  },
  //https://your-mattermost-url.com/api/v4/channels/{channel_id}/patch
  PathChannel: async (channel_id,params) => {
    try {
        return await mmapi.put(`channels/${channel_id}/patch`,params);
    } catch (error) {
        console.error(error);
    }
  },
  RemoveUserFromChannel: async (channel_id,user_id) => {
    // console.log('RemoveUserFromChannel');
    // return 'OK'
      try {
          return await mmapi.delete(`channels/${channel_id}/members/${user_id}`);
      } catch (error) {
          console.error(error);
      }
  }, 
  RemoveUserFromTeam: async (team_id,user_id) => {
    // return 'OK';
      try {
          return await mmapi.delete(`teams/${team_id}/members/${user_id}`);
      } catch (error) {
          console.error(error);
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
    // 如果返回 res.data.status_code === 404 , 说明成员不在此团队
      try {
          return await mmapi.get(`teams/${team_id}/members/${user_id}`);
      } catch (error) {
          console.error(error);
      }
  }, 
  getChannelMember: async (channel_id,user_id) => { 
    // return 'OK'
    // 如果返回 res.data.status_code === 404 , 说明成员不在此频道
      try {
          return await mmapi.get(`channels/${channel_id}/members/${user_id}`);
      } catch (error) {
          console.error(error);
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
          console.error(error);
      }
  },
  getPost: async (post_id) => {
    try {
      return await mmapi.get(`posts/${post_id}`,);
    } catch (error) {
      console.error(error);
    }
  },
  getThread: async (post_id) => {
    try {
      return await mmapi.get(`posts/${post_id}/thread`);
    } catch (error) {
      console.error(error);
    }
  },
  deleteTeam: async (team_id) => {
    try {
      return await mmapi.delete(`teams/${team_id}`);
    } catch (error) {
      console.error(error);
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
      console.error(error);
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
      console.error(error);
    }
  }
});
