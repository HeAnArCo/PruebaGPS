const express = require('express');
const bodyParser = require('body-parser');
const cassandra = require('cassandra-driver');

const app = express();
app.use(bodyParser.json());

// Configuración de Cassandra
const client = new cassandra.Client({
  contactPoints: ['127.0.0.1'], // Cambia si tu Cassandra está en otra IP
  localDataCenter: 'datacenter1',
  keyspace: 'gps_data'
});

client.connect()
  .then(() => console.log('Conectado a Cassandra'))
  .catch(err => console.error('Error conectando a Cassandra', err));

// Endpoint para guardar coordenadas
app.post('/api/save-location', async (req, res) => {
  const { lat, lng } = req.body;
  const query = 'INSERT INTO locations (id, lat, lng, timestamp) VALUES (uuid(), ?, ?, toTimestamp(now()))';

  try {
    await client.execute(query, [lat, lng], { prepare: true });
    res.json({ success: true, message: 'Ubicación guardada' });
  } catch (err) {
    console.error('Error al insertar en Cassandra', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = 4000;
app.listen(PORT, () => console.log(`Servidor backend corriendo en http://localhost:${PORT}`));

