// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import assert from 'assert';
import nock from 'nock';

import * as Actions from 'actions/groups';
import {Client4} from 'client';

import {RequestStatus, Groups} from 'constants';
import TestHelper from 'test/test_helper';
import configureStore from 'test/test_store';

describe('Actions.Groups', () => {
    let store;

    beforeEach(async () => {
        await TestHelper.initBasic(Client4);
        store = await configureStore();
    });

    afterEach(async () => {
        await TestHelper.tearDown();
    });

    it('getGroupSyncables', async () => {
        if (TestHelper.isLiveServer()) {
            console.log('Skipping mock-only test');
            return;
        }

        const groupID = '5rgoajywb3nfbdtyafbod47rya';

        const groupTeams = [
            {
                team_id: 'ge63nq31sbfy3duzq5f7yqn1kh',
                team_display_name: 'dolphins',
                team_type: 'O',
                group_id: '5rgoajywb3nfbdtyafbod47rya',
                can_leave: true,
                auto_add: true,
                create_at: 1542643748412,
                delete_at: 0,
                update_at: 1542643748412,
            },
            {
                team_id: 'tdjrcr3hg7yazyos17a53jduna',
                team_display_name: 'developers',
                team_type: 'O',
                group_id: '5rgoajywb3nfbdtyafbod47rya',
                can_leave: true,
                auto_add: true,
                create_at: 1542643825026,
                delete_at: 0,
                update_at: 1542643825026,
            },
        ];

        const groupChannels = [
            {
                channel_id: 'o3tdawqxot8kikzq8bk54zggbc',
                channel_display_name: 'standup',
                channel_type: 'P',
                team_id: 'tdjrcr3hg7yazyos17a53jduna',
                team_display_name: 'developers',
                team_type: 'O',
                group_id: '5rgoajywb3nfbdtyafbod47rya',
                can_leave: true,
                auto_add: true,
                create_at: 1542644105041,
                delete_at: 0,
                update_at: 1542644105041,
            },
            {
                channel_id: 's6oxu3embpdepyprx1fn5gjhea',
                channel_display_name: 'swimming',
                channel_type: 'P',
                team_id: 'ge63nq31sbfy3duzq5f7yqn1kh',
                team_display_name: 'dolphins',
                team_type: 'O',
                group_id: '5rgoajywb3nfbdtyafbod47rya',
                can_leave: true,
                auto_add: true,
                create_at: 1542644105042,
                delete_at: 0,
                update_at: 1542644105042,
            },
        ];

        nock(Client4.getBaseRoute()).
            get(`/groups/${groupID}/teams`).
            reply(200, groupTeams);

        nock(Client4.getBaseRoute()).
            get(`/groups/${groupID}/channels`).
            reply(200, groupChannels);

        await Actions.getGroupSyncables(groupID, Groups.SYNCABLE_TYPE_TEAM)(store.dispatch, store.getState);
        await Actions.getGroupSyncables(groupID, Groups.SYNCABLE_TYPE_CHANNEL)(store.dispatch, store.getState);

        const state = store.getState();
        const request = state.requests.groups.getGroupSyncables;
        if (request.status === RequestStatus.FAILURE) {
            throw new Error('getGroupSyncables request failed err=' + request.error);
        }

        const groupSyncables = state.entities.groups.syncables[groupID];
        assert.ok(groupSyncables);

        for (let i = 0; i < 2; i++) {
            assert.ok(JSON.stringify(groupSyncables.teams[i]) === JSON.stringify(groupTeams[i]));
            assert.ok(JSON.stringify(groupSyncables.channels[i]) === JSON.stringify(groupChannels[i]));
        }
    });

    it('getGroupMembers', async () => {
        if (TestHelper.isLiveServer()) {
            console.log('Skipping mock-only test');
            return;
        }

        const groupID = '5rgoajywb3nfbdtyafbod47rya';

        const response = {
            members: [
                {
                    id: 'ok1mtgwrn7gbzetzfdgircykir',
                    create_at: 1542658437708,
                    update_at: 1542658441412,
                    delete_at: 0,
                    username: 'test.161927',
                    auth_data: 'test.161927',
                    auth_service: 'ldap',
                    email: 'success+test.161927@simulator.amazonses.com',
                    email_verified: true,
                    nickname: '',
                    first_name: 'test',
                    last_name: 'test.161927',
                    position: '',
                    roles: 'system_user',
                    notify_props: {
                        channel: 'true',
                        comments: 'never',
                        desktop: 'mention',
                        desktop_sound: 'true',
                        email: 'true',
                        first_name: 'false',
                        mention_keys: 'test.161927,@test.161927',
                        push: 'mention',
                        push_status: 'away',
                    },
                    last_password_update: 1542658437708,
                    locale: 'en',
                    timezone: {
                        automaticTimezone: '',
                        manualTimezone: '',
                        useAutomaticTimezone: 'true',
                    },
                },
            ],
            total_member_count: 1,
        };

        nock(Client4.getBaseRoute()).
            get(`/groups/${groupID}/members?page=0&per_page=100`).
            reply(200, response);

        await Actions.getGroupMembers(groupID, 0, 100)(store.dispatch, store.getState);

        const state = store.getState();
        const request = state.requests.groups.getGroupMembers;
        if (request.status === RequestStatus.FAILURE) {
            throw new Error('getGroupMembers request failed err=' + request.error);
        }

        const groupMembers = state.entities.groups.members;
        assert.ok(groupMembers);
        assert.ok(groupMembers[groupID].totalMemberCount === response.total_member_count);

        assert.ok(JSON.stringify(response.members[0]) === JSON.stringify(groupMembers[groupID].members[0]));
    });

    it('getGroup', async () => {
        if (TestHelper.isLiveServer()) {
            console.log('Skipping mock-only test');
            return;
        }

        const groupID = '5rgoajywb3nfbdtyafbod47rya';

        const response = {
            id: '5rgoajywb3nfbdtyafbod47rya',
            name: '8b7ks7ngqbgndqutka48gfzaqh',
            display_name: 'Test Group 0',
            description: '',
            type: 'ldap',
            remote_id: '\\eb\\80\\94\\cd\\d4\\32\\7c\\45\\87\\79\\1b\\fe\\45\\d9\\ac\\7b',
            create_at: 1542399032816,
            update_at: 1542399032816,
            delete_at: 0,
            has_syncables: false,
        };

        nock(Client4.getBaseRoute()).
            get(`/groups/${groupID}`).
            reply(200, response);

        await Actions.getGroup(groupID)(store.dispatch, store.getState);

        const state = store.getState();
        const request = state.requests.groups.getGroup;
        if (request.status === RequestStatus.FAILURE) {
            throw new Error('getGroup request failed err=' + request.error);
        }

        const groups = state.entities.groups.groups;
        assert.ok(groups);
        assert.ok(groups[groupID]);
        assert.ok(JSON.stringify(response) === JSON.stringify(groups[groupID]));
    });

    it('linkGroupSyncable', async () => {
        if (TestHelper.isLiveServer()) {
            console.log('Skipping mock-only test');
            return;
        }

        const groupID = '5rgoajywb3nfbdtyafbod47rya';
        const teamID = 'ge63nq31sbfy3duzq5f7yqn1kh';
        const channelID = 'o3tdawqxot8kikzq8bk54zggbc';

        const groupTeamResponse = {
            team_id: 'ge63nq31sbfy3duzq5f7yqn1kh',
            group_id: '5rgoajywb3nfbdtyafbod47rya',
            can_leave: true,
            auto_add: true,
            create_at: 1542643748412,
            delete_at: 0,
            update_at: 1542660566032,
        };

        const groupChannelResponse = {
            channel_id: 'o3tdawqxot8kikzq8bk54zggbc',
            group_id: '5rgoajywb3nfbdtyafbod47rya',
            can_leave: true,
            auto_add: true,
            create_at: 1542644105041,
            delete_at: 0,
            update_at: 1542662607342,
        };

        nock(Client4.getBaseRoute()).
            post(`/groups/${groupID}/teams/${teamID}/link`).
            reply(200, groupTeamResponse);

        nock(Client4.getBaseRoute()).
            post(`/groups/${groupID}/channels/${channelID}/link`).
            reply(200, groupChannelResponse);

        await Actions.linkGroupSyncable(groupID, teamID, Groups.SYNCABLE_TYPE_TEAM)(store.dispatch, store.getState);
        await Actions.linkGroupSyncable(groupID, channelID, Groups.SYNCABLE_TYPE_CHANNEL)(store.dispatch, store.getState);

        const state = store.getState();
        const syncables = state.entities.groups.syncables;
        assert.ok(syncables[groupID]);

        assert.ok(JSON.stringify(syncables[groupID].teams[0]) === JSON.stringify(groupTeamResponse));
        assert.ok(JSON.stringify(syncables[groupID].channels[0]) === JSON.stringify(groupChannelResponse));
    });

    it('unlinkGroupSyncable', async () => {
        if (TestHelper.isLiveServer()) {
            console.log('Skipping mock-only test');
            return;
        }

        const groupID = '5rgoajywb3nfbdtyafbod47rya';
        const teamID = 'ge63nq31sbfy3duzq5f7yqn1kh';
        const channelID = 'o3tdawqxot8kikzq8bk54zggbc';

        const groupTeamResponse = {
            team_id: 'ge63nq31sbfy3duzq5f7yqn1kh',
            group_id: '5rgoajywb3nfbdtyafbod47rya',
            can_leave: true,
            auto_add: true,
            create_at: 1542643748412,
            delete_at: 0,
            update_at: 1542660566032,
        };

        const groupChannelResponse = {
            channel_id: 'o3tdawqxot8kikzq8bk54zggbc',
            group_id: '5rgoajywb3nfbdtyafbod47rya',
            can_leave: true,
            auto_add: true,
            create_at: 1542644105041,
            delete_at: 0,
            update_at: 1542662607342,
        };

        nock(Client4.getBaseRoute()).
            post(`/groups/${groupID}/teams/${teamID}/link`).
            reply(200, groupTeamResponse);

        nock(Client4.getBaseRoute()).
            post(`/groups/${groupID}/channels/${channelID}/link`).
            reply(200, groupChannelResponse);

        await Actions.linkGroupSyncable(groupID, teamID, Groups.SYNCABLE_TYPE_TEAM)(store.dispatch, store.getState);
        await Actions.linkGroupSyncable(groupID, channelID, Groups.SYNCABLE_TYPE_CHANNEL)(store.dispatch, store.getState);

        let state = store.getState();
        let syncables = state.entities.groups.syncables;
        assert.ok(syncables[groupID]);

        assert.ok(JSON.stringify(syncables[groupID].teams[0]) === JSON.stringify(groupTeamResponse));
        assert.ok(JSON.stringify(syncables[groupID].channels[0]) === JSON.stringify(groupChannelResponse));

        const beforeTeamsLength = syncables[groupID].teams.length;
        const beforeChannelsLength = syncables[groupID].channels.length;

        nock(Client4.getBaseRoute()).
            delete(`/groups/${groupID}/teams/${teamID}/link`).
            reply(204, {ok: true});

        nock(Client4.getBaseRoute()).
            delete(`/groups/${groupID}/channels/${channelID}/link`).
            reply(204, {ok: true});

        await Actions.unlinkGroupSyncable(groupID, teamID, Groups.SYNCABLE_TYPE_TEAM)(store.dispatch, store.getState);
        await Actions.unlinkGroupSyncable(groupID, channelID, Groups.SYNCABLE_TYPE_CHANNEL)(store.dispatch, store.getState);

        state = store.getState();
        syncables = state.entities.groups.syncables;

        assert.ok(syncables[groupID]);
        assert.ok(syncables[groupID].teams.length === beforeTeamsLength - 1);
        assert.ok(syncables[groupID].channels.length === beforeChannelsLength - 1);
    });
});
