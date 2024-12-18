AWS.config.update({
    region: 'us-west-1',
    credentials: new AWS.CognitoIdentityCredentials({
        IdentityPoolId: 'us-west-1:88200be6-614d-42b4-86d5-ee57e0fa5cdf'
    })
});
const docClient = new AWS.DynamoDB.DocumentClient();
export class Character {
    constructor(health, attack, skillstatuses) {
        this.health = health;
        this.attack = attack;
        this.max = health;
        this.skillstatuses = skillstatuses;
    }
    static async loadFromDb(characterName) {
        const params = {
            TableName: "Utopia",
            Key: {
                Name: characterName,
                ID: "0001"
            }
        };
        try {
            const data = await docClient.get(params).promise();
            return new Character(
                data.Item.Health,
                data.Item.Attack,
                data.Item.SkillStatuses
            );
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
}
export async function loadOwned() {
    const params = {
        TableName: 'Utopia',
        FilterExpression: 'attribute_exists(#owned) AND #owned = :ownedValue AND #id = :idValue',
        ExpressionAttributeNames: {
            '#owned': 'Owned',
            '#id': 'ID'
        },
        ExpressionAttributeValues: {
            ':ownedValue': true,
            ':idValue': '0001'
        }
    };
    try {
        const data = await docClient.scan(params).promise();
        return data.Items;
    } catch (error) {
        console.error(error);
        throw error;
    }
}
export async function loadEnemies() {
    const params = {
        TableName: 'Utopia',
        KeyConditionExpression: '#id = :idValue',
        FilterExpression: 'attribute_exists(#defeated)',
        ExpressionAttributeNames: {
            '#defeated': 'Defeated',
            '#id': 'ID'
        },
        ExpressionAttributeValues: {
            ':idValue': '0001'
        }
    };
    try {
        const data = await docClient.query(params).promise();
        return data.Items;
    } catch (error) {
        console.error(error);
        throw error;
    }
}
export async function storeBattle() {
    const params = {
        TableName: "Utopia",
        Key: {
            Name: "Battle",
            ID: "0001"
        }
    };
    try {
        const data = await docClient.get(params).promise();
        const updateParams = {
            TableName: "Utopia",
            Key: {
                Name: data.Item.Enemy,
                ID: "0001"
            },
            UpdateExpression: "SET #defeated = :result",
            ExpressionAttributeNames: {
                "#defeated": "Defeated"
            },
            ExpressionAttributeValues: {
                ":result": true
            }
        };
        await docClient.update(updateParams).promise();
    } catch (err) {
        console.error(err);
        throw err;
    }
}
export async function storeExp() {
    const params = {
        TableName: "Utopia",
        Key: {
            Name: "Battle",
            ID: "0001"
        }
    };
    try {
        const data = await docClient.get(params).promise();
        const enemyparams = {
            TableName: "Utopia",
            Key: {
                Name: data.Item.Enemy,
                ID: "0001"
            }
        };
        const enemydata = await docClient.get(enemyparams).promise();
        const updateExp = [0, 1, 2].map(index => {
            const allyparams = {
                TableName: "Utopia",
                Key: {
                    Name: data.Item.Party[index],
                    ID: "0001"
                },
                UpdateExpression: "SET #exp = #exp + :expgain",
                ExpressionAttributeNames: {
                    '#exp': "Exp"
                },
                ExpressionAttributeValues: {
                    ":expgain": Number(enemydata.Item.Level * 1000)
                }
            };
            return docClient.update(allyparams).promise();        
        });
        await Promise.all(updateExp);
        const updateLevels = [0, 1, 2].map(async index => {
            const allyparams = {
                TableName: "Utopia",
                Key: {
                    Name: data.Item.Party[index],
                    ID: "0001"
                },
                UpdateExpression: "SET #level = #level + :one, #attack = #attack + :ten, #health = #health + :hundred, #threshold = #threshold + :thousand",
                ConditionExpression: "#exp > #threshold",
                ExpressionAttributeNames: {
                    '#level': "Level",
                    '#attack': "Attack",
                    '#health': "Health",
                    '#exp': "Exp",
                    '#threshold': "Threshold"
                },
                ExpressionAttributeValues: {
                    ":one": 1,          
                    ":ten": 10,
                    ":hundred": 100,
                    ":thousand": 1000
                }
            };
            try {
                await docClient.update(allyparams).promise();
            } catch (err) {
                if (err.code !== 'ConditionalCheckFailedException') {
                    throw err;
                }
            }
        });           
        await Promise.all(updateLevels);        
    } catch (err) {
        console.error(err);
        throw err;
    }
}