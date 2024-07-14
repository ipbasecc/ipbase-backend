const axios = require('axios');
const mmapi = axios.create({
    baseURL: process.env.MM_API,
});
mmapi.interceptors.request.use((config) => {
    config.headers.Authorization = `Bearer ${process.env.MM_MASTER_TOKEN}`;
    config.headers['Content-Type'] = 'application/json';
    return config;
});

// https://api.mattermost.com/#tag/channels/operation/GetChannelMembersForUser
// https://your-mattermost-url.com/api/v4/users/{user_id}/teams/{team_id}/channels/members
module.exports = {
    fetchMemberdataOfChannel: async function(user_id,team_id) {
        try {
            const res = await mmapi.get(`users/${user_id}/teams/${team_id}/channels/members`);
            if(res) {
                return res
            }
        } catch (error) {
            console.error(error);
            return error
        }
    },
}