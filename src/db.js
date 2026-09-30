const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});

// DocumentClient simplifica el trabajo con DynamoDB (no hay que mandar tipos {S, N, ...} a mano)
const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

const TABLE_NAME = process.env.TABLE_NAME || 'CatalogProducts';

module.exports = { docClient, TABLE_NAME };
