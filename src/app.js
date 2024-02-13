import express from 'express';

//importamos mis archivos de routes
import productsRoutes from './routes/products.router.js'
import cartsRoutes from './routes/carts.router.js'

//importamos utils
import __dirname from '../utils.js'

const app = express();
const PORT = 8080;

//El Mildware, para que no haya probleams al leer archivos json:
app.use(express.json())
app.use(express.urlencoded({extended: true }))

//Configuracion de archivos estaticos:
app.use(express.static(__dirname + '/src/public'))

//Puntos de entrada para routes:
app.use('/api/products', productsRoutes) //La ruta puede cambiar según lo que queramos
app.use('/api/carts', cartsRoutes)

//Configuracion de mi server
app.listen(PORT, () => {
	console.log(`Levantamos el servidor en el puerto ${PORT}`)
})