'use strict';

const crypto = require('crypto');
const { Repo, TableRepo } = require("./repo.js");

class User {
    /**
     * @param {string} _id 
     * @param {string} _name 
     */
    constructor(_id, _name) {
        this.id = _id || newUIDD();
        this.name = _name;
    }

    asEntity() {
        return {
            partitionKey: "",
            rowKey: this.id,
            username: this.name
        }
    }

    asResponse() {
        return {
            _id: this.id,
            username: this.name
        }
    }

    /**
     * @param {import('@azure/data-tables').TableEntity} entity 
     */
    static fromEntity(entity) {
        return new User(entity.rowKey, entity.username);
    }

    static async fetchAll() {
        const users = await Repo
            .Users()
            .fetchAllEntities();

        return users.map(this.fromEntity);
    }

    /**
     * @param {string} _userName 
     * @returns {Promise<User>}
     */
    static async storeNew(_userName) {

        if (!_userName)
            throw new Error("No username provided.");

        //check is user with that name already exists and return if so
        const users = await Repo
            .Users()
            .fetchEntitiesByProperty("username", _userName);

        if (users.length > 0) {
            return User.fromEntity(users[0]);
        }
        else {
            let user = new User(null, _userName);

            await Repo
                .Users()
                .createNew(user.asEntity());

            return user;
        }
    }

    static async fetchById(_id) {

        if (!_id)
            throw new Error("No User Id provided");

        const entity = await Repo
            .Users()
            .fetchEntityByRowKey(_id);

        if (!entity)
            return undefined;

        return User.fromEntity(entity);
    }


}


class Exercise {
    /**
     * @param {User} _user 
     * @param {string} _description 
     * @param {Number} _duration 
     * @param {EpochTimeStamp} _date 
     */
    constructor(_user, _description, _duration, _date) {
        this.user = _user;
        this.id = newUIDD();
        this.description = _description;
        this.duration = _duration;
        this.date = _date || Date.now();
    }

    dateUTC() {
        return new Date(this.date);
    }

    asEntity() {
        return {
            partitionKey: "",
            rowKey: this.id,
            _userId: this.user.id,
            date: this.date,
            duration: this.duration,
            description: this.description
        }
    }

    asResponse() {
        return {
            _id: this.user.id,
            username: this.user.name,
            date: new Date(this.date).toDateString(),
            duration: this.duration,
            description: this.description
        }
    }

    static fromEntity(user, entity) {
        return new Exercise(entity.rowKey, entity.username);
    }

    /**
     * @param {User} _user 
     * @param {string} _description 
     * @param {Number} _duration 
     * @param {Date} _date 
     */
    static async storeNew(_user, _description, _duration, _date) {

        if (!_user)
            throw new Error("User is required.");

        if (!_description)
            throw new Error("Description is required");

        let __duration = parseInt(_duration);
        if (!__duration || __duration < 0)
            throw new Error("Duration is required to be a positive integer.");

        let __date = parseDateInput2Unix(_date);

        let exercise = new Exercise(_user, _description, __duration, __date);

        await Repo
            .Exercises()
            .createNew(exercise.asEntity());

        return exercise;
    }


    static async fetchLogArray(user, from, to, limit) {
        if (!user)
            throw new Error("User is required.");

        let filter = `_userId eq '${user.id}'`;

        const _from = Date.parse(from);
        if (_from) {
            filter += ` and date ge ${_from}L`;
        }

        const _to = Date.parse(to);
        if (_to) {
            filter += ` and date le ${_to}L`;
        }

        let exercises = await Repo
            .Exercises()
            .fetchEntities(filter, parseInt(limit));

        if (!exercises) {
            return [];
        }
        else {
            return exercises.map(x => {
                return {
                    description: x.description,
                    duration: x.duration,
                    date: (new Date(x.date)).toDateString(),
                }
            });
        }
    }

    static async fetchAll() {
        let exercises = await Repo
            .Exercises()
            .fetchAllEntities();

        return exercises.map(x => {
            return {
                description: x.description,
                duration: x.duration,
                date: (new Date(x.date)).toDateString(),
            }
        });
    }

}

function newUIDD() {
    return crypto.randomUUID().replace(/-/gi, '');
}

function parseDateInput2Unix(_date) {
    const _now = Date.now();
    if (_date && _date !== "") {
        return Date.parse(_date) || _now;
    }
    return _now;
}

module.exports = {
    User,
    Exercise
};