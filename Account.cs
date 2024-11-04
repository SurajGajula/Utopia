using UnityEngine;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.Model;
using System.Collections.Generic;
using System.Threading.Tasks;
public class Account : MonoBehaviour
{
    private AmazonDynamoDBClient dynamoDBClient;
    private void Awake()
    {
        dynamoDBClient = new AmazonDynamoDBClient();
    }
    public async Task<int?> GetPrisms()
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
        return null;
    }
    public async Task UsePrisms()
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
            var response = await dynamoDBClient.GetItemAsync(getItemRequest);
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
            }
        }
        catch (AmazonDynamoDBException e)
        {
            Debug.LogError($"{e.Message}");
        }
    }
}