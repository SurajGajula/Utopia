import { initializeAWS } from './auth.js';
const getDynamoClient = async () => {
    await initializeAWS();
    return new AWS.DynamoDB.DocumentClient();
};
export class Character {
    constructor(health, attack, skillplus = null, skillplusplus = null) {
        this.health = health;
        this.attack = attack;
        this.max = health;
        this.skillplus = skillplus;
        this.skillplusplus = skillplusplus;
    }
    static async loadEnemy(enemyName) {
        const docClient = await getDynamoClient();
        const params = {
            TableName: "Utopia",
            Key: {
                Name: enemyName,
                ID: sessionStorage.getItem('userSub')
            }
        };
        try {
            const data = await docClient.get(params).promise();
            return new Character(
                data.Item.Health,
                data.Item.Attack
            );
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
    static async loadAlly(index) {
        const docClient = await getDynamoClient();
        const allyparams = {
            TableName: "Utopia",
            Key: {
                Name: 'Battle',
                ID: sessionStorage.getItem('userSub')
            }
        };
        const allyData = await docClient.get(allyparams).promise();
        const allyName = allyData.Item.Party[index];
        const params = {
            TableName: "Utopia",
            Key: {
                Name: allyName,
                ID: sessionStorage.getItem('userSub')
            }
        };
        try {
            const data = await docClient.get(params).promise();
            return new Character(
                data.Item.Health,
                data.Item.Attack,
                data.Item.SkillPlus,
                data.Item.SkillPlusPlus
            );
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
}
export async function loadOwned() {
    const docClient = await getDynamoClient();
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
    const docClient = await getDynamoClient();
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
    const docClient = await getDynamoClient();
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
    const docClient = await getDynamoClient();
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
                UpdateExpression: "SET #level = #level + :one, #attack = #attack + :ten, #health = #health + :hundred, #exp = #exp - #threshold, #threshold = #threshold + :thousand",
                ConditionExpression: "#exp >= #threshold",
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
export async function dailyPulls() {
    try {
        const docClient = await getDynamoClient();
        const pstDate = new Date().toLocaleString("en-US", {
            timeZone: "America/Los_Angeles"
        });
        const currentDayPST = new Date(pstDate).getDate();
        const params = {
            TableName: "Utopia",
            Key: {
                Name: "Pulls",
                ID: sessionStorage.getItem('userSub')
            }
        };
        const data = await docClient.get(params).promise();
        if (data.Item.Date < currentDayPST) {
            const updateParams = {
                TableName: "Utopia",
                Key: {
                    Name: "Pulls",
                    ID: sessionStorage.getItem('userSub')
                },
                UpdateExpression: "SET #date = :currentDay, #count = #count + :addCount",
                ExpressionAttributeNames: {
                    "#date": "Date",
                    "#count": "Count"
                },
                ExpressionAttributeValues: {
                    ":currentDay": currentDayPST,
                    ":addCount": 100
                },
                ReturnValues: "ALL_NEW"
            };
            await docClient.update(updateParams).promise();
        }
    } catch (error) {
        console.error('Error in dailyPulls:', error);
        throw error;
    }
}
export async function loadPulls() {
    try {
        const docClient = await getDynamoClient();
        const params = {
            TableName: "Utopia",
            Key: {
                Name: "Pulls",
                ID: sessionStorage.getItem('userSub')
            }
        };
        const data = await docClient.get(params).promise();
        return data.Item.Count;
    } catch (error) {
        console.error('Error in loadPulls:', error);
        throw error;
    }
}