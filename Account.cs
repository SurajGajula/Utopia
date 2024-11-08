using UnityEngine;
using System;
using Amazon;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.Model;
using System.Collections.Generic;
using System.Threading.Tasks;
public class Account : MonoBehaviour
{
    private AmazonDynamoDBClient dynamoDBClient;
    private void Awake()
    {
        var config = new AmazonDynamoDBConfig
        {
            RegionEndpoint = RegionEndpoint.USWest1
        };
        dynamoDBClient = new AmazonDynamoDBClient(config);
    }
    public async Task<int> GetPrisms()
    {
        var getItemRequest = new GetItemRequest
        {
            TableName = "Utopia",
            Key = new Dictionary<string, AttributeValue>
        {
            { "ID", new AttributeValue { S = "0001" } },
            { "Name", new AttributeValue { S = "Prisms" } }
        }
        };
        try
        {
            var response = await dynamoDBClient.GetItemAsync(getItemRequest);
            response.Item.TryGetValue("Count", out var countValue);
            return int.Parse(countValue.N);
        }
        catch (AmazonDynamoDBException e)
        {
            Debug.LogError($"{e.Message}");
        }
        return 0;
    }
    public async Task<bool> UsePrisms()
    {
        var getRequest = new GetItemRequest
        {
            TableName = "Utopia",
            Key = new Dictionary<string, AttributeValue>
        {
            { "ID", new AttributeValue { S = "0001" } },
            { "Name", new AttributeValue { S = "Prisms" } }
        }
        };
        try
        {
            var response = await dynamoDBClient.GetItemAsync(getRequest);
            response.Item.TryGetValue("Count", out var countValue);
            var currentCount = int.Parse(countValue.N);
            if (currentCount > 1000)
            {
                var updateRequest = new UpdateItemRequest
                {
                    TableName = "Utopia",
                    Key = getRequest.Key,
                    UpdateExpression = "SET #count = :newCount",
                    ExpressionAttributeNames = new Dictionary<string, string>
                    {
                        {"#count", "Count"}
                    },
                    ExpressionAttributeValues = new Dictionary<string, AttributeValue>
                    {
                        {":newCount", new AttributeValue { N = (currentCount - 1000).ToString() }}
                    }
                };
                await dynamoDBClient.UpdateItemAsync(updateRequest);
                return true;
            }
            else
            {
                return false;
            }
        }
        catch (AmazonDynamoDBException e)
        {
            Debug.LogError($"{e.Message}");
            return false;
        }
    }
    public async Task DailyPrism()
    {
        var getRequest = new GetItemRequest
        {
            TableName = "Utopia",
            Key = new Dictionary<string, AttributeValue>
        {
            { "ID", new AttributeValue { S = "0001" } },
            { "Name", new AttributeValue { S = "Prisms" } }
        }
        };
        try
        {
            var response = await dynamoDBClient.GetItemAsync(getRequest);
            response.Item.TryGetValue("Count", out var countValue);
            var currentCount = int.Parse(countValue.N);
            response.Item.TryGetValue("Date", out var lastUpdateValue);
            var lastUpdateDate = DateTime.Parse(lastUpdateValue.S);
            var currentDate = DateTime.UtcNow.Date;
            if (currentDate > lastUpdateDate)
            {
                var newCount = currentCount + 100;
                var updateRequest = new UpdateItemRequest
                {
                    TableName = "Utopia",
                    Key = getRequest.Key,
                    UpdateExpression = "SET #count = :newCount, #lastUpdate = :currentDate",
                    ExpressionAttributeNames = new Dictionary<string, string>
                {
                    {"#count", "Count"},
                    {"#lastUpdate", "Date"}
                },
                    ExpressionAttributeValues = new Dictionary<string, AttributeValue>
                {
                    {":newCount", new AttributeValue { N = newCount.ToString() }},
                    {":currentDate", new AttributeValue { S = currentDate.ToString("yyyy-MM-dd") }}
                }
                };
                await dynamoDBClient.UpdateItemAsync(updateRequest);
            }
        }
        catch (AmazonDynamoDBException e)
        {
            Debug.LogError($"{e.Message}");
        }
    }
    public async Task AddAlly(string name)
    {
        try
        {
            var getItemRequest = new GetItemRequest
            {
                TableName = "Utopia",
                Key = new Dictionary<string, AttributeValue>
                {
                    { "ID", new AttributeValue { S = "0001" } },
                    { "Name", new AttributeValue { S = name } }
                }
            };
            var getItemResponse = await dynamoDBClient.GetItemAsync(getItemRequest);
            if (!getItemResponse.IsItemSet)
            {
                var putItemRequest = new PutItemRequest
                {
                    TableName = "Utopia",
                    Item = new Dictionary<string, AttributeValue>
                    {
                        { "ID", new AttributeValue { S = "0001" } },
                        { "Name", new AttributeValue { S = name } },
                        { "Attack", new AttributeValue { N = "10" } },
                        { "Health", new AttributeValue { N = "100" } },
                        { "Level", new AttributeValue { N = "1" } },
                        { "Exp", new AttributeValue { N = "0" } }
                    }
                };
                await dynamoDBClient.PutItemAsync(putItemRequest);
            }
        }
        catch (AmazonDynamoDBException e)
        {
            Debug.LogError($"{e.Message}");
        }
    }
}