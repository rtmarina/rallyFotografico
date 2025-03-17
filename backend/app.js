const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors()); // Permitir comunicación entre frontend y backend
app.use(express.json());
app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});
