import { initializeAWS } from '/auth.js';
const getDynamoClient = async () => {
    await initializeAWS();
    return new AWS.DynamoDB.DocumentClient();
};
export class Character {
    constructor(name, health, attack, skillname = null) {
        this.name = name;
        this.health = health;
        this.attack = attack;
        this.max = health;
        this.skillname = skillname;
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
                data.Item.Name,
                data.Item.Health,
                data.Item.Attack,
                data.Item.SkillName
            );
        } catch (err) {
            console.error("Error in load Enemies", err);
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
                data.Item.Name,
                data.Item.Health,
                data.Item.Attack,
                data.Item.SkillName
            );
        } catch (err) {
            console.error("Error in load Ally", err);
            throw err;
        }
    }
}
export async function loadAllies() {
    const docClient = await getDynamoClient();
    const params = {
        TableName: 'Utopia',
        FilterExpression: 'attribute_exists(#level) AND #id = :idValue',
        ExpressionAttributeNames: {
            '#level': 'Level',
            '#id': 'ID'
        },
        ExpressionAttributeValues: {
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
        FilterExpression: 'attribute_exists(#defeated) AND #id = :idValue',
        ExpressionAttributeNames: {
            '#defeated': 'Defeated',
            '#id': 'ID'
        },
        ExpressionAttributeValues: {
            ':idValue': sessionStorage.getItem('userSub')
        }
    };
    try {
        const data = await docClient.scan(params).promise();
        return data.Items;
    } catch (error) {
        console.error("Error in loadEnemies", error);
        throw error;
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
                ID: 'Sample'
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
        console.error("Error in storeEXP", err);
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
        if (data.Item.Date != currentDayPST) {
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
export async function storeParty(allyName, index) {
    try {
        const docClient = await getDynamoClient();
        const params = {
            TableName: "Utopia",
            Key: {
                Name: "Battle",
                ID: sessionStorage.getItem('userSub')
            }
        };
        const data = await docClient.get(params).promise();
        let party = data.Item.Party;
        const currentIndex = party.indexOf(allyName);
        if (currentIndex === -1) {
            party[index] = allyName;
        } 
        else if (currentIndex !== index) {
            const temp = party[index];
            party[index] = allyName;
            party[currentIndex] = temp;
        }
        const updateParams = {
            TableName: "Utopia",
            Key: {
                Name: "Battle",
                ID: sessionStorage.getItem('userSub')
            },
            UpdateExpression: "SET Party = :party",
            ExpressionAttributeValues: {
                ":party": party
            }
        };
        await docClient.update(updateParams).promise();
        return party;
    } catch (error) {
        console.error('Error in loadParty:', error);
        throw error;
    }
}
export async function loadBanners() {
    const docClient = await getDynamoClient();
    const params = {
        TableName: 'UtopiaBanners'
    };
    try {
        const data = await docClient.scan(params).promise();
        return data.Items;
    } catch (error) {
        console.error("Error in loadBanners", error);
        throw error;
    }
}
export async function checkPulls() {
    const docClient = await getDynamoClient();
    const params = {
        TableName: 'Utopia',
        Key: {
            'ID': sessionStorage.getItem('userSub'),
            'Name': 'Pulls'
        }
    };
    try {
        const data = await docClient.get(params).promise();
        if (data.Item && data.Item.Count >= 1000) {
            return true;
        }
        return false;
    } catch (error) {
        console.error("Error checking pulls:", error);
        return false;
    }
}
export async function storePull(bannerName) {
    try {
        const docClient = await getDynamoClient();
        const params = {
            TableName: "UtopiaBanners",
            Key: {
                Name: bannerName,
                ID: "Sample"
            }
        };
        const data = await docClient.get(params).promise();
        const updateParams = {
            TableName: "Utopia",
            Key: {
                Name: "Pulls",
                ID: sessionStorage.getItem('userSub')
            },
            UpdateExpression: "SET #count = #count - :hundred",
            ExpressionAttributeNames: {
                "#count": "Count"
            },
            ExpressionAttributeValues: {
                ":hundred": 100
            }
        };
        await docClient.update(updateParams).promise();
        const index = Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / (0xffffffff + 1) * data.Item.Featured.length);
        const allyName = data.Item.Featured[index];
        return allyName
    } catch (error) {
        console.error('Error in storePulls:', error);
        throw error;
    }
}
export async function loadUpdates() {
    const docClient = await getDynamoClient();
    const params = {
        TableName: 'UtopiaUpdates'
    };
    try {
        const data = await docClient.scan(params).promise();
        return data.Items;
    } catch (error) {
        console.error("Error in loadUpdates", error);
        throw error;
    }
}