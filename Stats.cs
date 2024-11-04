using UnityEngine;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.Model;
using System.Collections.Generic;
using System.Threading.Tasks;
public class Stats : MonoBehaviour
{
    public int health;
    public int attack;
    public int level;
    public int exp;
    public string[] skillnames;
    private AmazonDynamoDBClient dynamoDBClient;
    private void Awake()
    {
        dynamoDBClient = new AmazonDynamoDBClient();
    }
    public async Task GetStats(string name, bool ally = true)
    {
        string key = (ally ? "0001" : "0000");
        var getItemRequest = new GetItemRequest
        {
            TableName = "Utopia",
            Key = new Dictionary<string, AttributeValue>
        {
            { "ID", new AttributeValue { S = key } },
            { "Name", new AttributeValue { S = name } }
        }
        };
        try
        {
            var response = await dynamoDBClient.GetItemAsync(getItemRequest);
            if (response.Item.TryGetValue("Health", out var healthValue))
                health = int.Parse(healthValue.N);
            if (response.Item.TryGetValue("Attack", out var attackValue))
                attack = int.Parse(attackValue.N);
            if (response.Item.TryGetValue("Exp", out var expValue))
                exp = int.Parse(expValue.N);
            if (response.Item.TryGetValue("Level", out var levelValue))
                level = int.Parse(levelValue.N);
        }
        catch (AmazonDynamoDBException e)
        {
            Debug.LogError($"{e.Message}");
        }
    }
    public async Task PutExp(string name, int addedexp)
    {
        try
        {
            var getRequest = new GetItemRequest
            {
                TableName = "Utopia",
                Key = new Dictionary<string, AttributeValue>
                    {
                        { "ID", new AttributeValue { S = "0001" } },
                        { "Name", new AttributeValue { S = name } }
                    }
            };
            var response = await dynamoDBClient.GetItemAsync(getRequest);
            response.Item.TryGetValue("Exp", out var expValue);
            response.Item.TryGetValue("Level", out var levelValue);
            response.Item.TryGetValue("Health", out AttributeValue healthValue);
            response.Item.TryGetValue("Attack", out AttributeValue attackValue);
            int newAttack = int.Parse(attackValue.N);
            int newHealth = int.Parse(healthValue.N);
            int newExp = int.Parse(expValue.N) + addedexp;
            int newLevel = int.Parse(levelValue.N);
            if (newExp >= 1000)
            {
                newExp %= 1000;
                newLevel++;
                newAttack += 10;
                newHealth += 100;
            }
            var updateRequest = new UpdateItemRequest
            {
                TableName = "Utopia",
                Key = getRequest.Key,
                UpdateExpression = "SET Exp = :newExp, #lvl = :newLevel, Attack = :newAttack, Health = :newHealth",
                ExpressionAttributeNames = new Dictionary<string, string>
                    {
                        { "#lvl", "Level" }
                    },
                ExpressionAttributeValues = new Dictionary<string, AttributeValue>
                    {
                        { ":newAttack", new AttributeValue { N = newAttack.ToString() } },
                        { ":newHealth", new AttributeValue { N = newHealth.ToString() } },
                        { ":newExp", new AttributeValue { N = newExp.ToString() } },
                        { ":newLevel", new AttributeValue { N = newLevel.ToString() } }
                    }
            };
            await dynamoDBClient.UpdateItemAsync(updateRequest);
        }
        catch (AmazonDynamoDBException e)
        {
            Debug.LogError($"{e.Message}");
        }
    }
}