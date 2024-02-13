import { Router } from 'express';
import fs from 'fs';
const router = Router();
const direcName = "././archivos"
const fileName = direcName + "/carrito.json"
const fileNameProducts = direcName + "/productos.json"

//Dejamos funcionando este crack
router.post('/', (request, response) => {
    try {
        if(fs.existsSync(fileName)){
            let carts = fs.readFileSync(fileName, "utf-8")
            if (!carts) {
                carts = [];
            } else {
                carts = JSON.parse(carts);
            }

            const cart = {}

            //Generador de Id
            const idGenerator= Math.floor(Math.random() * 10000)
            cart.id = idGenerator
            if(carts.length > 0){
                const cartsId = carts.map(cart => cart.id)
                if(cartsId.includes(cart.id)){
                    while(cartsId.includes(cart.id)){
                            cart.id = idGenerator
                    }
                }
            }

            cart.products = []

            carts.push(cart)
            fs.writeFileSync(fileName, JSON.stringify(carts, null, 2));
            return response.send(`Se ha creado un nuevo carrito con id=${cart.id}`)
        }
    } catch (error) {
        console.error("Ha surgido este error: " + error)
        response.status(500).send('<h2 style="color: red">¡Oh oh! Ha surgido un error, por lo tanto, no se pudo crear un carrito.</h2>')
    }
})

//Params 
router.get('/:cid', (request, response) => {
    try {
        if(fs.existsSync(fileName)){
            let carts = fs.readFileSync(fileName, "utf-8")
            carts = JSON.parse(carts);
            let cartId = request.params.cid

            if(carts && carts.length > 0){
				const idSearch = carts.find(cart => cart.id === parseInt(cartId))
				if(idSearch){
					return response.send(idSearch.products)
				}
				return response.send({msg: `El carrito con el id=${cartId} no existe.`})
			}
			else {
				return response.send('<h2 style="color: red">No hay carritos disponibles, por lo tanto, no podemos ejecutar esto.</h2>');
			}
        }
    } catch (error) {
        console.error("Ha surgido este error: " + error)
        response.status(500).send('<h2 style="color: red">¡Oh oh! Ha surgido un error, por lo tanto, no se pudo buscar el carrito.</h2>')
    }
})

//2 params para agregar a un carrito específico, un producto específico
router.post('/:cid/product/:pid', (request, response) => {
    try {
        if(fs.existsSync(fileName)){
            let carts = fs.readFileSync(fileName, "utf-8")
            carts = JSON.parse(carts);
            let cartId = request.params.cid
            let productId = request.params.pid 

            if(carts && carts.length > 0){
				let idSearch = carts.find(cart => cart.id === parseInt(cartId))
				if(idSearch){
                    let productsCart = idSearch.products
                    if(fs.existsSync(fileNameProducts)){
                        let products = fs.readFileSync(fileNameProducts, "utf-8")
                        products = JSON.parse(products)
                        const productsId = products.map(product => product.id)
                        if(productsId.includes(parseInt(productId))){
                            let productsIdCart = productsCart.map(prod => prod.product)
                        
                            if(productsIdCart.includes(parseInt(productId))){
                                const productPosition = productsCart.findIndex(prod => prod.product === parseInt(productId))
                                productsCart[productPosition].quantity++;
                            }
                            else{
                                const newProduct = {
                                    product: parseInt(productId),
                                    quantity: 1
                                }
                                productsCart.push(newProduct)
                            }
                            fs.writeFileSync(fileName, JSON.stringify(carts, null, 2));
                            return response.send(`Se ha agregado el producto con el id=${productId} al carrito con id=${cartId}`)
                        }
                        else{
                            return response.send(`Oh Oh, no puedes agregar el producto con el id=${productId} porque no existe :(`)
                        }
                    }
				}
				return response.send({msg: `El carrito con el id=${cartId} no existe.`})
			}
			else {
				return response.send('<h2 style="color: red">No hay carritos disponibles, por lo tanto, no podemos ejecutar esto.</h2>');
			}
        }
    } catch (error) {
        console.error("Ha surgido este error: " + error)
        response.status(500).send('<h2 style="color: red">¡Oh oh! Ha surgido un error, por lo tanto, no se pudo agregar un producto al carrito.</h2>')
    }
})

export default router;