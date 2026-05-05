import api from './axios';

// ---- Auth ----
// export const authAPI = {
//     login: (data: any) => api.post('/auth/login', data),
//     register: (data: any) => api.post('/auth/register', data),
//     getMe: () => api.get('/auth/me'),
//     getUsers: () => api.get('/auth/users'),
// };

// ---- Teams ----
export const teamsAPI = {
    getAll: (params?: { sport?: string }) => api.get('/teams', { params }),
    getById: (id: string) => api.get(`/teams/${id}`),
    create: (data: any) => api.post('/teams', data),
    update: (id: string, data: any) => api.put(`/teams/${id}`, data),
    remove: (id: string) => api.delete(`/teams/${id}`),
};

// ---- Players ----
export const playersAPI = {
    getAll: (params?: { teamId?: string; sport?: string }) => api.get('/players', { params }),
    getById: (id: string) => api.get(`/players/${id}`),
    create: (data: any) => api.post('/players', data),
    update: (id: string, data: any) => api.put(`/players/${id}`, data),
    remove: (id: string) => api.delete(`/players/${id}`),
};

// ---- Matches ----
export const matchesAPI = {
    getAll: (params?: { status?: string; sport?: string }) => api.get('/matches', { params }),
    getLive: () => api.get('/matches/live'),
    getUpcoming: () => api.get('/matches/upcoming'),
    getFinished: () => api.get('/matches/finished'),
    getById: (id: string) => api.get(`/matches/${id}`),
    getStats: () => api.get('/matches/stats'),
    create: (data: any) => api.post('/matches', data),
    update: (id: string, data: any) => api.put(`/matches/${id}`, data),
    updateScore: (id: string, data: any) => api.patch(`/matches/${id}/score`, data),
    updateStatus: (id: string, status: string) => api.patch(`/matches/${id}/status`, { status }),
    remove: (id: string) => api.delete(`/matches/${id}`),
};

// ---- Commentary ----
export const commentaryAPI = {
    getByMatch: (matchId: string) => api.get(`/commentary/${matchId}`),
    create: (data: any) => api.post('/commentary', data),
};

// ---- Auth ----
export const authAPI = {
    login: (data: any) => api.post('/auth/login', data),
    register: (data: any) => api.post('/auth/register', data),
    getMe: () => api.get('/auth/me'),
    getUsers: () => api.get('/auth/users'),
    updateUserRole: (id: string, role: string) => api.patch(`/auth/users/${id}/role`, { role }),
    deleteUser: (id: string) => api.delete(`/auth/users/${id}`),
    updateProfile: (data: { name: string }) => api.patch('/auth/profile', data),
    changePassword: (data: { oldPassword: string; newPassword: string }) => api.post('/auth/change-password', data),
    getFavorites: () => api.get('/auth/favorites'),
    addFavoriteTeam: (teamId: string) => api.post(`/auth/favorites/teams/${teamId}`),
    removeFavoriteTeam: (teamId: string) => api.delete(`/auth/favorites/teams/${teamId}`),
    addFavoritePlayer: (playerId: string) => api.post(`/auth/favorites/players/${playerId}`),
    removeFavoritePlayer: (playerId: string) => api.delete(`/auth/favorites/players/${playerId}`),
};

// ---- System ----
export const searchAPI = {
    search: (query: string) => api.get(`/search?q=${query}`),
    suggest: (query: string) => api.get(`/search/suggest?q=${query}`),
};

export const systemAPI = {
    getSettings: () => api.get('/system/settings'),
    updateSettings: (data: { apiMode?: string }) => api.patch('/system/settings', data),
    broadcastNotification: (data: { message: string; type?: string }) => api.post('/system/broadcast', data),
};

// ---- Favorites ----
export const favoritesAPI = {
    getAll: () => api.get('/favorites'),
    toggleTeam: (teamId: string) => api.post(`/favorites/team/${teamId}`),
    togglePlayer: (playerId: string) => api.post(`/favorites/player/${playerId}`),
};

// ---- Notifications ----
export const notificationsAPI = {
    getAll: () => api.get('/notifications'),
    getUnreadCount: () => api.get('/notifications/unread-count'),
    sendSystem: (data: { title: string; message: string }) => api.post('/notifications/system', data),
    sendMatch: (data: { title: string; message: string; matchId?: string; userIds?: string[] }) => api.post('/notifications/match', data),
    broadcast: (data: { title: string; message: string; type?: string }) => api.post('/notifications/broadcast', data),
    markRead: (id: string) => api.patch(`/notifications/${id}/read`),
    delete: (id: string) => api.delete(`/notifications/${id}`),
};

export const liveAPI = {
    getAll: (sport?: string) => api.get('/live', { params: sport ? { sport } : {} }),
    getSeries: (offset?: number) => api.get('/cricapi/series', { params: { offset } }),
    getCountries: (offset?: number) => api.get('/cricapi/countries', { params: { offset } }),
    getMatchInfo: (id: string) => api.get(`/cricapi/match/${id}/info`),
    getScorecard: (id: string) => api.get(`/cricapi/match/${id}/scorecard`),
    getSquad: (id: string) => api.get(`/cricapi/match/${id}/squad`),
    getPlayerInfo: (id: string) => api.get(`/cricapi/player/${id}`),
    getCricketTeams: () => api.get('/cricapi/teams'),
    getCricketPlayers: (teamId?: string) => api.get('/cricapi/players', { params: teamId ? { teamId } : {} }),
    getCricketCountries: () => api.get('/cricapi/countries'),
    // Full Suite
    getCricketSeries: (search?: string) => api.get('/cricapi/series', { params: { search } }),
    getCricketSeriesInfo: (id: string) => api.get('/cricapi/series_info', { params: { id } }),
    getCricketSeriesSquad: (id: string) => api.get('/cricapi/series_squad', { params: { id } }),
    getCricketMatchesList: () => api.get('/cricapi/matches'),
    getCricketCurrentMatches: () => api.get('/cricapi/currentMatches'),
    getCricketMatchDetail: (id: string) => api.get('/cricapi/match_info', { params: { id } }),
    getCricketMatchSquad: (id: string) => api.get('/cricapi/match_squad', { params: { id } }),
    getCricketMatchScorecard: (id: string) => api.get('/cricapi/match_scorecard', { params: { id } }),
    getCricketMatchPoints: (id: string) => api.get('/cricapi/match_points', { params: { id } }),
    getCricketLiveScore: (id: string) => api.get('/cricapi/cricScore', { params: { id } }),
    getCricketPlayerDetail: (id: string) => api.get('/cricapi/players_info', { params: { id } }),
};

// ---- Player Stats (TheSportsDB) ----
export const playerAPI = {
    search: (name: string) => api.get('/player/search', { params: { name } }),
};
