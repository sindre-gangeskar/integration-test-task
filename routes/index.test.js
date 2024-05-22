const express = require('express');
const path = require('path');
const app = express();
const indexRouter = require('../routes/index');
const request = require('supertest');
const { parseData, saveData } = require('../data/js/custom');
const usersFilePath = path.resolve(__dirname, '../data/users.json');
app.use(express.json());
app.use('/', indexRouter);

jest.mock('../data/js/custom', () => ({
    parseData: jest.fn(),
    saveData: jest.fn()
}));

jest.mock('../data/users.json', () => ({
    "users": [
        {
            "username": "user1",
            "password": "password",
            "score": 999
        },
        {
            "username": "user2",
            "password": "password",
            "score": 999
        }
    ]
}))

var mockUserData = {
    users: [
        {
            "username": "user1",
            "password": "password",
            "score": 999
        },
        {
            "username": "user2",
            "password": "password",
            "score": 999
        }
    ]
};

describe('testing-index-route', () => {
    beforeEach(() => {
        parseData.mockReset();
        saveData.mockReset();
    });
    test('/ GET - success', async () => {
        parseData.mockReturnValue(mockUserData);
        const response = await request(app).get('/');

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual([
            {
                "username": "user1",
                "password": "password",
                "score": 999
            },
            {
                "username": "user2",
                "password": "password",
                "score": 999
            }
        ])
    })
    test('/ GET - failed', async () => {
        parseData.mockReturnValue(undefined);
        const response = await request(app).get('/');
        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual({ message: 'Failed retrieving users - could not be found' });
    })
    test('/ POST - success', async () => {
        const userObj = { username: "jestUser3", password: "password", score: -1 };
        const initialUserData = { users: [ { username: "user1", password: "password", score: 1 } ] };
        parseData.mockReturnValue(initialUserData);

        const updatedUserData = JSON.parse(JSON.stringify(initialUserData));
        updatedUserData.users.push(userObj);

        // Mock saving implementation
        saveData.mockImplementation(() => { });
        const { body, statusCode } = await request(app).post('/').send(userObj);
        expect(statusCode).toBe(201);
        expect(body).toEqual({ message: 'Successfully created user', body: userObj })
        expect(saveData).toHaveBeenCalledWith(expect.any(String), updatedUserData);
    })
    test('/ POST - failed', async () => {
        const userObj = { username: "jestUser3", password: "password", score: -1 };
        const initialUserData = { users: [ { username: "jestUser3", password: "password", score: 1 } ] };

        parseData.mockReturnValue(initialUserData);

        const { body, statusCode } = await request(app).post('/').send(userObj);
        expect(statusCode).toBe(400);
        expect(body).toEqual({ message: 'User already exists' });
        expect(saveData).not.toHaveBeenCalled();
    });
    test('/ DELETE - success', async () => {
        const initialUserData = { users: [ { username: "jestUser3", password: "password", score: 1 } ] };
        const deleteUserObj = { username: 'jestUser3' };

        parseData.mockReturnValue(initialUserData);
        let updatedUserData = JSON.parse(JSON.stringify(initialUserData));
        updatedUserData = updatedUserData.users.filter(x => x.username !== deleteUserObj.username);

        saveData.mockImplementation(() => { });

        const { body, statusCode } = await request(app).delete('/').send(deleteUserObj);
        expect(statusCode).toBe(200);
        expect(body).toEqual({ message: 'Successfully deleted user:', user: deleteUserObj })
        expect(saveData).toHaveBeenCalledWith(usersFilePath, { users: [] });
    })
    test('/ DELETE - failed', async () => {
        const initialUserData = { users: [ { username: "jestUser3", password: "password", score: 1 } ] };
        const deleteUserObj = { username: 'jestUser4' };

        parseData.mockReturnValue(initialUserData);
        saveData.mockImplementation(() => { });

        const { body, statusCode } = await request(app).delete('/').send(deleteUserObj);
        expect(statusCode).toBe(400);
        expect(body).toEqual({ message: 'User does not exist or has been deleted in a prior action', user: deleteUserObj })
        expect(saveData).not.toHaveBeenCalled();
    })
})
