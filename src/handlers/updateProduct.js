const { UpdateCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient, TABLE_NAME } = require('../db');
const { success, error } = require('../utils/response');

const ALLOWED_FIELDS = ['name', 'description', 'price', 'category', 'imageUrl', 'stock'];

exports.handler = async (event) => {
  try {
    const { id } = event.pathParameters || {};
    if (!id) return error(400, 'Falta el parámetro "id"');

    const body = JSON.parse(event.body || '{}');
    const fieldsToUpdate = Object.keys(body).filter((k) => ALLOWED_FIELDS.includes(k));

    if (fieldsToUpdate.length === 0) {
      return error(400, `Debés enviar al menos uno de estos campos: ${ALLOWED_FIELDS.join(', ')}`);
    }

    const existing = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { id },
    }));

    if (!existing.Item) return error(404, 'Producto no encontrado');

    const updateExpr = [];
    const exprNames = {};
    const exprValues = {};

    fieldsToUpdate.forEach((field, i) => {
      updateExpr.push(`#f${i} = :v${i}`);
      exprNames[`#f${i}`] = field;
      exprValues[`:v${i}`] = body[field];
    });

    updateExpr.push('#updatedAt = :updatedAt');
    exprNames['#updatedAt'] = 'updatedAt';
    exprValues[':updatedAt'] = new Date().toISOString();

    const result = await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: `SET ${updateExpr.join(', ')}`,
      ExpressionAttributeNames: exprNames,
      ExpressionAttributeValues: exprValues,
      ReturnValues: 'ALL_NEW',
    }));

    return success(200, result.Attributes);
  } catch (err) {
    console.error('Error actualizando producto:', err);
    return error(500, 'Error interno al actualizar el producto');
  }
};
