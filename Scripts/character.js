AWS.config.update({
    region: 'us-west-1',
    credentials: new AWS.CognitoIdentityCredentials({
        IdentityPoolId: 'us-west-1:be5f5c85-6e5f-421a-a20d-11f7b049b5d1',
        Logins: {
            'cognito-idp.us-west-1.amazonaws.com/us-west-1_RAU6R6pD0': sessionStorage.getItem('id_token')
        }
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
                ID: sessionStorage.getItem('userSub')
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
            ':idValue': sessionStorage.getItem('userSub')
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
            ':idValue': sessionStorage.getItem('userSub')
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
            ID: sessionStorage.getItem('userSub')
        }
    };
    try {
        const data = await docClient.get(params).promise();
        const updateParams = {
            TableName: "Utopia",
            Key: {
                Name: data.Item.Enemy,
                ID: sessionStorage.getItem('userSub')
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
            ID: sessionStorage.getItem('userSub')
        }
    };
    try {
        const data = await docClient.get(params).promise();
        const enemyparams = {
            TableName: "Utopia",
            Key: {
                Name: data.Item.Enemy,
                ID: sessionStorage.getItem('userSub')
            }
        };
        const enemydata = await docClient.get(enemyparams).promise();
        const updateExp = [0, 1, 2].map(index => {
            const allyparams = {
                TableName: "Utopia",
                Key: {
                    Name: data.Item.Party[index],
                    ID: sessionStorage.getItem('userSub')
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
                    ID: sessionStorage.getItem('userSub')
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