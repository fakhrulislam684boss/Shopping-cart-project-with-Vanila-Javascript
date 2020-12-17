let clearCartBtn = document.querySelector('.clear-cart-btn')
let cartBtn = document.querySelector('.cart-btn')
let closeCart = document.querySelector('.close-cart')
let cartDOM = document.querySelector('.cart')
let cartOverlay  = document.querySelector('.cart-overlay')
let cartItem = document.querySelector('.cart-items')
let cartTotal = document.querySelector('.cart-total')
let cartContent = document.querySelector('.cart-content')
let productsDOM = document.querySelector('.productsDOM')


// cart
let cart = []

// buttons
let buttonsDOM = []
class Products{

    async getProducts(){
        try {
            let result = await fetch("products.json");
            let data = await result.json()
            let products = data.items
            products = products.map(item =>{
                let {title,price} = item.fields
                let {id} = item.sys
                let image = item.fields.image.fields.file.url
                return {title,price,id,image}

            })
            return products
        } catch (error) {
            console.log(error);
            
        }
    }

}

class UI{
    displayProducts(products){
        let result = ''
        products.forEach(product =>{
            
            result +=
            `   <div class="col-md-3">
                    <article class="product">
                        <div class="img-container">
                
                            <div class="card">
                                <img src=${product.image} class="card-img-top" alt="...">
                
                            </div>
                            <button class="bag-btn" data-id=${product.id}>
                                <i class="fas fa-shopping-cart"></i>
                                add to cart
                            </button>
                        </div>
                        <h3>${product.title}</h3>
                        <h4>${product.price}</h4>
                    </article>
                </div>
            `
        })
        productsDOM.innerHTML = result

        

        
    }
    getBagButtons(){
        let buttons = [...document.querySelectorAll(".bag-btn")]
        buttonsDOM = buttons
        buttons.forEach((button) =>{
            let id = button.dataset.id;
            let inCart = cart.find( item => item.id === id)
            if(inCart){
                button.innerHTML = 'In Cart'
                button.disabled = true 
            }else{
                button.addEventListener('click',(e)=>{
            
                    e.target.innerText = 'In Cart'

                    e.target.disabled = true

                    // get product  from products

                    let cartItem = {...Storage.getProduct(id),amount:1}
                
                    // add product to the cart 

                    cart = [...cart,cartItem]
                    console.log(cart)
                    

                    // save cart in local storage 
                    Storage.saveCart(cart)
                    // set cart values
                    this.setCartValues(cart)
                    // display cart item
                    this.addCartItem(cartItem)

                    // show the cart item 
                    this.showCart()
                })
            }

        })
        
    }
    setCartValues(cart){
        let tempTotal = 0
        let itemsTotal = 0
        cart.map(item =>{
            tempTotal += item.price*item.amount
            itemsTotal += item.amount 
        })
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2))
        cartItem.innerText = itemsTotal
        
    }
    addCartItem(item){
        let div = document.createElement('div')
        div.className = 'row mb-3'
        div.innerHTML = `<div class="col">
                    <img src=${item.image} class="cart-img" alt='product'>
                    </div>
                    <div class="col">
                        <div class="content-text">${item.title}</div>
                        <h5  class="content-text1">${item.price}</h5>
                        <span class="remove-item" data-id=${item.id}>remove</span>
                    </div>
                    <div class="col chevron1 pl-5">
                        <i class="fas fa-chevron-up chev" data-id=${item.id}></i>
                        <p class="item-amount chev">${item.amount}</p>
                        <i class="fas fa-chevron-down chev" data-id =${item.id}></i>
                    </div>`
        cartContent.appendChild(div)

    }
    showCart(){
        cartOverlay.style.visibility = 'visible'
        cartDOM.style.transform = 'translateX(0)'
    }
    setupApp(){
        cart = Storage.getCart()
        this.setCartValues(cart)
        this.showInCart(cart)
        cartBtn.addEventListener('click',this.showCart)
        closeCart.addEventListener('click',this.hideCart)
    }
    showInCart(cart){
        cart.forEach(item => this.addCartItem(item))
    }
    hideCart(){
        cartOverlay.style.visibility = 'hidden'
        cartDOM.style.transform = 'translateX(100%)'
    }
    cartLogic(){
        clearCartBtn.addEventListener('click',()=>{
            this.clearCart()    // confused
        })

        // cart fuctionalaty

        cartContent.addEventListener('click', (e) =>{
            if(e.target.classList.contains("remove-item")){
                let removeItem = e.target
                let id = removeItem.dataset.id 
                cartContent.removeChild(removeItem.parentElement.parentElement)
                this.removeItem(id)
            }
            else if(e.target.classList.contains('fa-chevron-up')){
                let addAmount = e.target
                let id = addAmount.dataset.id
                let tempItem = cart.find( item => item.id === id)
                
                tempItem.amount ++
                Storage.saveCart(cart)
                this.setCartValues(cart)
                addAmount.nextElementSibling.innerText = tempItem.amount

            }
            else if(e.target.classList.contains('fa-chevron-down')){
                let lowerAmount = e.target
                let id = lowerAmount.dataset.id
                let tempItem = cart.find( item => item.id === id)
                
                tempItem.amount --
                if(tempItem.amount >0){
                    Storage.saveCart(cart)
                    this.setCartValues(cart)
                    lowerAmount.previousElementSibling.innerText = tempItem.amount
                }else{
                    cartContent.removeChild(lowerAmount.parentElement.parentElement)
                    this.removeItem(id)
                }
                

            }
        })
    }
    clearCart(){
        let cartItemId = cart.map( item => item.id) // selected cartitems id 
        cartItemId.forEach( id => this.removeItem(id)) 
        cartContent.innerHTML ='' // remove item by selected id 
        
    }
    removeItem(id){
        cart = cart.filter( item => item.id !== id )
        this.setCartValues(cart)
        Storage.saveCart(cart)
        let button = this.getSingleBtn(id)
        button.disabled = false
        button.innerHTML = `<i class="fas fa-shopping-cart"></i> add to cart`
        this.hideCart()
    }
    getSingleBtn(id){
        return buttonsDOM.find( button => button.dataset.id === id )
    }

}

class Storage{

    static saveProducts(products){
        localStorage.setItem('products',JSON.stringify(products))
    }

    static getProduct(id){
        let products = JSON.parse(localStorage.getItem('products'))
        return products.find(product => product.id === id)
    }

    static saveCart(cart){
        localStorage.setItem('cart',JSON.stringify(cart))
    }

    static  getCart(){
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')):[]
    }



}

document.addEventListener("DOMContentLoaded",()=>{
    let ui  = new UI();
    let products = new Products()


    // Setup App
    ui.setupApp()

    // get  All Product

    products.getProducts().then((products) =>{
        ui.displayProducts(products)
        Storage.saveProducts(products)
    }).then(()=>{
        ui.getBagButtons()
        ui.cartLogic()
    })
    
})


