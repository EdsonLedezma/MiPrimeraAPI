const express = require('express');
const fs = require('fs/promises');
const app = express();
const PORT = 3000;

let data = {
  autos: [],
  clientes: [],
};

let proximoIDCliente = 1;  

app.use(express.json());

//envía como respuesta el arreglo autos almacenado en el objeto data con la funcion de devolucion
// de llamada en este caso imprime todos los objetos de autos.
app.get('/api/autos', (req, res) => {
  res.json(data.autos);
});


app.get('/api/autos/:id', (req, res) => {
  //devuelve el parametro id de autos guardandolo en una constante auto y lo convierte a entero
  const auto = data.autos.find(car => car.id === parseInt(req.params.id));
  //si el auto no existe (es diferente a cualquier id del arreglo) se envia una respuesta de estado 404
  if (!auto) {
    return res.status(404).json({ mensaje: 'Auto no encontrado' });
  }
  res.json(auto);
});


app.post('/api/autos', async (req, res) => {
  const { modelo, marca, año, placas } = req.body;

  if (!modelo || !marca || !año || !placas) {
    return res.status(400).json({ mensaje: 'Todos los campos (modelo, marca, año, placas) son obligatorios' });
  }

  const nuevoAuto = { id: data.autos.length + 1, modelo, marca, año, placas };
  data.autos.push(nuevoAuto);

  await guardarDatosEnArchivo();
  
  res.json(nuevoAuto);
});




app.put('/api/autos/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const autoExistente = data.autos.find(car => car.id === id);
  if (!autoExistente) {
    return res.status(404).json({ mensaje: 'Auto no encontrado' });
  }

  const indice = data.autos.indexOf(autoExistente);
  data.autos[indice] = { ...autoExistente, ...req.body };

  await guardarDatosEnArchivo();

  res.json(data.autos[indice]);
});

/* Verifica si el auto existe, lo elimina del arreglo,
 guarda los datos actualizados en un archivo y luego 
 responde con un mensaje indicando que el auto ha sido 
 eliminado exitosamente. Si el auto no se encuentra, 
 responde con un código de estado 404*/
app.delete('/api/autos/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const autoExistente = data.autos.find(car => car.id === id);
  if (!autoExistente) {
    return res.status(404).json({ mensaje: 'Auto no encontrado' });
  }

  data.autos = data.autos.filter(car => car.id !== id);

  await guardarDatosEnArchivo();

  res.json({ mensaje: 'Auto eliminado exitosamente' });
});


app.get('/api/clientes', (req, res) => {
  res.json(data.clientes);
});


app.get('/api/clientes/:id', (req, res) => {
  const cliente = data.clientes.find(client => client.id === parseInt(req.params.id));
  if (!cliente) {
    return res.status(404).json({ mensaje: 'Cliente no encontrado' });
  }
  res.json(cliente);
});

app.post('/api/clientes', async (req, res) => {
  const { nombre, usuario, direccion } = req.body;

  if (!nombre || !usuario || !direccion) {
    return res.status(400).json({ mensaje: 'Todos los campos (nombre, usuario, direccion) son obligatorios' });
  }

  const nuevoCliente = { id: proximoIDCliente++, nombre, usuario, direccion };
  data.clientes.push(nuevoCliente);

  await guardarDatosEnArchivo();
  
  res.json(nuevoCliente);
});


// Ruta para actualizar un cliente
app.put('/api/clientes/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const clienteExistente = data.clientes.find(client => client.id === id);
  if (!clienteExistente) {
    return res.status(404).json({ mensaje: 'Cliente no encontrado' });
  }

  const indice = data.clientes.indexOf(clienteExistente);
  data.clientes[indice] = { ...clienteExistente, ...req.body };

  await guardarDatosEnArchivo();

  res.json(data.clientes[indice]);
});

// Ruta para borrar un cliente
app.delete('/api/clientes/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const clienteExistente = data.clientes.find(client => client.id === id);
  if (!clienteExistente) {
    return res.status(404).json({ mensaje: 'Cliente no encontrado' });
  }

  data.clientes = data.clientes.filter(client => client.id !== id);

  await guardarDatosEnArchivo();

  res.json({ mensaje: 'Cliente eliminado exitosamente' });
});

// Función para cargar data.json
async function cargarDatosDesdeArchivo() {
  try {
    const contenido = await fs.readFile('data.json', 'utf-8');
    data = JSON.parse(contenido);
  } catch (error) {
    console.error('Error al cargar datos desde el archivo:', error);
  }
}

/*await fs.writeFile('data.json', JSON.stringify(data, null, 2));
Utiliza la función writeFile del módulo fs para escribir los datos
 contenidos en el objeto data en el archivo data.json. JSON.stringify(data, null, 2)
  convierte el objeto data en una cadena JSON con formato y una sangría de 2 espacios.
   La palabra clave await se utiliza para esperar a que la operación de escritura del 
   archivo se complete antes de continuar. */
async function guardarDatosEnArchivo() {
  try {
    await fs.writeFile('data.json', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error al guardar datos en el archivo:', error);
  }
}

//dsagbsaf
cargarDatosDesdeArchivo().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
  });
});
