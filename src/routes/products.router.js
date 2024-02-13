import { Router } from 'express';
import { uploader } from '../../utils.js';
import bodyParser from 'body-parser';
import fs from 'fs';
//Importamos esto para que pueda eliminar las imagenes asociadas a un producto eliminado
import path from 'path';
import __dirname from '../../utils.js';

const router = Router();
const direcName = "././archivos"
const fileName = direcName + "/productos.json"

// Configurar el middleware body-parser para analizar el cuerpo de la solicitud en formato JSON. Agregue esto porque no me capturaba el request.body al crear un producto con postman
router.use(bodyParser.json());


//Nos muestra todos los productos
router.get('/', (request,response) => {
    try {
        if(fs.existsSync(fileName)){
            let products = fs.readFileSync(fileName, "utf-8")
			if (!products) {
                products = [];
				response.send("Ooooh, parece que no hay productos disponibles.")
            } else {
                products = JSON.parse(products)
				response.send({products})
            }
        }
    } catch (error) {
        console.error("Error al intentar parsear el archivo array.json: " + error);
        response.status(500).send('<h2 style="color: red">¡Oh oh! Ha surgido un error.</h2>')
    }
})

//query, limit
router.get('/valor', (request, response) => {
    try {
		if(fs.existsSync(fileName)){
			let products = fs.readFileSync(fileName, "utf-8")

			//Esto es para ver si esta vacío el archivo
			if (!products.trim()) {
                return response.send('<h2 style="color: red">No hay productos disponibles, por lo tanto, no podemos ejecutar esto.</h2>');
            }

			products = JSON.parse(products)
			let { limit } = request.query

			if(products && products.length > 0){
				if(!limit){
					return response.send(products)
				}
				//Aqui vamos
				else if(parseInt(limit) <= products.length){
					let productsQuery = []
					for(let i=0; i<parseInt(limit); i++){
						productsQuery.push(JSON.parse(JSON.stringify(products[i])))
					}
					return response.send(productsQuery)
				}
				else{
					return response.send("¡Oh Oh!, el valor límite de productos a mostrar es mayor a la cantidad de productos totales.")
				}
			}
			else{
				return response.send('<h2 style="color: red">No hay productos disponibles, por lo tanto, no podemos ejecutar esto.</h2>');
			}
		}
	} catch (error) {
		console.error("Ha surgido este error: " + error)
		response.status(500).send('<h2 style="color: red">¡Oh oh! Ha surgido un error, por lo tanto, no se pudo mostrar lo solicitado.</h2>')
	}
})

//Params Id
router.get('/:pid', (request,response) => {
    try {
		if(fs.existsSync(fileName)){
			let products = fs.readFileSync(fileName, "utf-8")

			//Esto es para ver si esta vacío el archivo
			if (!products.trim()) {
                return response.send('<h2 style="color: red">No hay productos disponibles, por lo tanto, no podemos ejecutar esto.</h2>');
            }

			products = JSON.parse(products)
			let productId = request.params.pid
			if(products && products.length > 0){
				const idSearch = products.find(prod => prod.id === parseInt(productId))
				if(idSearch){
					return response.send(idSearch)
				}
				return response.send({msg: `El producto con el id=${productId} no existe.`})
			}
			else {
				return response.send('<h2 style="color: red">No hay productos disponibles, por lo tanto, no podemos ejecutar esto.</h2>');
			}
		}
	} catch (error) {
		console.error("Ha surgido este error: " + error)
		response.status(500).send('<h2 style="color: red">¡Oh oh! Ha surgido un error, por lo tanto, no se pudo mostrar lo solicitado.</h2>')
	}
})


router.post('/', uploader.array('files'), (request, response) => {
    try {
        if (fs.existsSync(fileName)) {
            let products = fs.readFileSync(fileName, "utf-8");
			if (!products) {
                products = [];
            } else {
                products = JSON.parse(products)
            }

			const { title, description, code, price, stock, category } = request.body;

            if (!title || !description || !code || !price || !stock || !category) {
				if (request.files && request.files.length > 0) {
					//Esto es para evitar que se guarden archivos si los parametros no estan completos
                    request.files.forEach(file => {
                        fs.unlinkSync(file.path);
                    });
				}
                return response.status(400).send({ status: "error", msg: "¡Oh oh! no has completado todos los parametros, y por lo tanto, no se puede agregar el nuevo producto." });
            }

            const idGenerator = Math.floor(Math.random() * 10000)
			const product = {
                id: idGenerator, 
                title,
                description,
                code,
                price: parseInt(price),
                stock: parseInt(stock),
                category: category.toLowerCase(),
                thumbnail: request.files ? request.files.map(file => file.path) : [], // Obtener las rutas de los archivos subidos si los hay
                status: true // Establecer el estado del producto por defecto
            };

			//Esto es para garatizar que ningun id se repite
			if(product.length > 0){
				const productsId = products.map(product => product.id)
				if(productsId.includes(product.id)){
					while(productsId.includes(product.id)){
						product.id = idGenerator
					}
				}
			}

            // Agregamos el producto al sistema
            products.push(product);
            fs.writeFileSync(fileName, JSON.stringify(products, null, 2));
            return response.send({ status: "Success", msg: `Se ha creado un nuevo producto exitosamente con id=${product.id} :)` });
        }
    } catch (error) {
        console.error("Ha surgido este error: " + error);
        response.status(500).send('<h2 style="color: red">¡Oh oh! Ha surgido un error, por lo tanto, no se pudo crear un nuevo producto.</h2>');
    }
});

//Para actualizar un producto
router.put('/:pid', (request,response) => { 
	try {
		if(fs.existsSync(fileName)){
			let products = fs.readFileSync(fileName, "utf-8")

			//Esto es para ver si esta vacío el archivo
			if (!products.trim()) {
                return response.send('<h2 style="color: red">No hay productos disponibles, por lo tanto, no podemos ejecutar esto.</h2>');
            }

			products = JSON.parse(products)
			let productId = request.params.pid
			let productUpdate = request.body
			const productPosition = products.findIndex(prod => prod.id === parseInt(productId))

			if (productPosition < 0) { //Verificamos que el arreglo no este vacío
				return response.status(202).send ({ status: "info", error: `No se ha encontrado ningún producto con id=${productId}.` });
			}

			products[productPosition] = productUpdate
			fs.writeFileSync(fileName, JSON.stringify(products, null, 2));
			return response.send({ status: "Success", message: "Se ha actualizado el producto con éxito :)", data: products[productPosition] })
		}
	} catch (error) {
		console.error("Ha surgido este error: " + error)
        response.status(500).send('<h2 style="color: red">¡Oh oh! Ha surgido un error, por lo tanto, no se pudo actualizar el producto.</h2>')
	}
})


//Vamos a eliminar un producto
router.delete('/:pid', (request,response) => {
	try {
		if(fs.existsSync(fileName)){
			let products = fs.readFileSync(fileName, "utf-8")
			products = JSON.parse(products)
			let productId = request.params.pid
			const productsSize = products.length
			const productPosition = products.findIndex(prod => prod.id === parseInt(productId))

			if (productPosition < 0){ //Checamos que el array no este vacío
				return response.status(202).send({ status: "info", error: `No se ha encontrado ningún producto con id=${productId}.` }) ;
			}

			//Eliminamos tambien la imagen
			const productToDelete = products[productPosition];
			if (productToDelete.thumbnail && productToDelete.thumbnail.length > 0) {
				productToDelete.thumbnail.forEach(image => {
					// Construimos la ruta absoluta, porque no me funcionaba de otra manera
					const imagePath = path.resolve(__dirname, '../public', image); 
					if (fs.existsSync(imagePath)) {
						try {
							fs.unlinkSync(imagePath);
						} catch (error) {
							console.error(`Error al eliminar ${imagePath}: ${error}`);
						}
					} else {
						console.log(`${imagePath} no existe`);
					}
				});
            }

			products.splice(productPosition, 1); //Eliminamos mi usuario de mi array users
			if (products.length === productsSize) { //Si no se elimino el user, mostramos el siguiente error:
				return response.status(500).send({ status: "error", error: `¡oh oh! El producto con id=${productId} no se pudo borrar.` });
			}
			fs.writeFileSync(fileName, JSON.stringify(products, null, 2));
			response.send({ status: "Success", message: `El producto con id=${productId} ha sido eliminado.` });
		}
	} catch (error) {
		console.error("Ha surgido este error: " + error)
        response.status(500).send('<h2 style="color: red">¡Oh oh! Ha surgido un error, por lo tanto, no se pudo eliminar el producto.</h2>')
	}
})

export default router;