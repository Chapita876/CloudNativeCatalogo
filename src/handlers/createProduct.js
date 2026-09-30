const { v4: uuidv4 } = require('uuid');
const { PutCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient, TABLE_NAME } = require('../db');
const { success, error } = require('../utils/response');

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');

    if (!body.name || typeof body.price !== 'number') {
      return error(400, 'Los campos "name" (string) y "price" (number) son obligatorios');
    }

    const now = new Date().toISOString();
    const product = {
      id: uuidv4(),
      name: body.name,
      description: body.description || '',
      price: body.price,
      category: body.category || 'general',
      imageUrl: body.imageUrl || null,
      stock: typeof body.stock === 'number' ? body.stock : 0,
      createdAt: now,
      updatedAt: now,
    };

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: product,
    }));

    return success(201, product);
  } catch (err) {
    console.error('Error creando producto:', err);
    return error(500, 'Error interno al crear el producto');
  }
};
