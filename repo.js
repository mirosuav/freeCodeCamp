
const { TableClient } = require("@azure/data-tables");
const { DefaultAzureCredential } = require('@azure/identity');

//https://learn.microsoft.com/en-us/azure/storage/blobs/storage-quickstart-blobs-nodejs?tabs=managed-identity%2Croles-azure-portal%2Csign-in-visual-studio-code#tabpanel_2_managed-identity
const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
if (!accountName) throw Error('Azure Storage accountName not found');

const dbEndpoint = `https://${accountName}.table.core.windows.net`;
const dbCredential = new DefaultAzureCredential()

class Repo {

    static usersRepo;
    static exercisesRepo;

    /**
     * 
     * @returns TableRepo
     */
    static Users() {
        return Repo.usersRepo ??= new TableRepo(new TableClient(
            dbEndpoint,
            'exerciseUsers',
            dbCredential
        ));
    }

    static Exercises() {
        return Repo.exercisesRepo ??= new TableRepo(new TableClient(
            dbEndpoint,
            'exerciseRecords',
            dbCredential
        ));
    }
}

class TableRepo {

    constructor(_tableClient) {
        this.tableClient = _tableClient;
    }

    async createNew(_entity) {
        await this.tableClient.createEntity(_entity);
    }

    async fetchAllEntities() {
        try {
            let entities = [];
            let iter = this.tableClient.listEntities();
            for await (let entity of iter) {
                entities.push(entity);
            }
            return entities;
        } catch (error) {
            console.error(`Error occurred while fetching entities: ${error.message}`);
            return undefined;
        }
    }

    async fetchEntitiesByProperty(propertyName, propertyValue) {
        return await this.fetchEntities(`${propertyName} eq '${propertyValue}'`);
    }
    
    /**
     * 
     * @param {string} _filterPhrase 
     * @param {number} _limit 
     * @returns 
     */
    async fetchEntities(_filterPhrase, _limit) {
        try {
            let _count = 0;
            let entities = [];
            let iter = this.tableClient.listEntities({
                queryOptions: { filter: _filterPhrase }
            });
            for await (let entity of iter) {
                entities.push(entity);
                _count += 1;
                if (_limit && _count >= _limit)
                    break;
            }
            return entities;
        } catch (error) {
            console.error(`Error occurred while fetching entities: ${error.message}`);
            return undefined;
        }
    }

    async fetchEntityByRowKey(_key) {
        try {
            return await this.tableClient.getEntity("", _key);
        } catch (error) {
            console.error(`Error occurred while fetching entity (RowKey:${_key}): ${error.message}`);
            return undefined;
        }
    }


    //Timestamp gt datetime'2012-12-10T15:00:00'
}


module.exports = {
    Repo,
    TableRepo
};