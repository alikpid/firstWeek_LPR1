Vue.component('product-details', {
    template: `
   <div class="product-details">
       <p>Details:</p>
       <ul>
           <li v-for="detail in details">{{ detail }}</li>
       </ul>
   </div>
 `,
    data() {
        return {
            details: ['80% cotton', '20% polyester', 'Gender-neutral'],
        }
    },
})

Vue.component('product-review', {
    template: `
       <form class="review-form" @submit.prevent="onSubmit">
       
       <p v-if="errors.length">
         <b>Please correct the following error(s):</b>
         <ul>
            <li v-for="error in errors">{{ error }}</li>
         </ul>
       </p>

       <p>
         <label for="name">Name:</label>
         <input id="name" v-model="name" placeholder="name">
       </p>
    
       <p>
         <label for="review">Review:</label>
         <textarea id="review" v-model="review"></textarea>
       </p>
    
       <p>
         <label for="rating">Rating:</label>
         <select id="rating" v-model.number="rating">
           <option>5</option>
           <option>4</option>
           <option>3</option>
           <option>2</option>
           <option>1</option>
         </select>
       </p>
    
       <p>Would you recommend this product?</p>
       <div class="radioInput">
            <input type="radio" name="rec" id="yes" value="yes" v-model="recommend">
                <label for="yes">Yes!</label>
           <input type="radio" name="rec" id="no" value="no" v-model="recommend">
                <label for="no">Nope</label>
       </div>
    
       <p>
         <input type="submit" value="Submit"> 
       </p>
       </form>
 `,
    data() {
        return {
            name: null,
            review: null,
            rating: null,
            errors: [],
            recommend: null
        }
    },
    methods: {
        onSubmit() {
            if(this.name && this.review && this.rating && this.recommend) {
                let productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating,
                    recommend: this.recommend
                }
                this.$emit('review-submitted', productReview)
                this.name = null
                this.review = null
                this.rating = null
                this.recommend = null
            } else {
                if(!this.name) this.errors.push("Name required.")
                if(!this.review) this.errors.push("Review required.")
                if(!this.rating) this.errors.push("Rating required.")
                if(!this.recommend) this.errors.push("Choice about recommendation required.")
            }
        }
    }
})


Vue.component('product', {
    props: {
        premium: {
            type: Boolean,
            required: true
        },
        cart: {
            type: Array
        }
    },
    template: `
   <div class="product">
        <div class="product-image">
            <img :src="image" :alt="altText"/>
        </div>

        <div class="product-info">
            <h1>{{ title }} <span v-show="sale">!Sale!</span></h1>
            <p>{{description}}</p>

            <p v-if="!inStock"
               v-bind:class="{ notActive: !inStock }"
               :style="{ textDecorationLine: 'line-through'}"
            >Out of stock</p>
            <p v-else-if="inStock <= 10 && inStock > 0">Almost sold out!</p>
            <p v-else>In stock</p>
            <a :href="link">More products like this</a>

            <product-details></product-details>

            <p>Sizes:</p>
            <ul>
                <li v-for="size in sizes">{{ size }}</li>
            </ul>

            <div class="colors">
                <div class="color-box"
                     v-for="(variant, index) in variants"
                     :key="variant.variantId"
                     :style="{ backgroundColor:variant.variantColor }"
                     @mouseover="updateProduct(index)"
                >
                </div>
            </div>
            
            <p>Shipping: {{ shipping }}</p>
            
            <button v-on:click="addToCart"
                    :disabled="!inStock"
                    :class="{ disabledButton: !inStock }"
            >
                Add to cart
            </button>
            <button class="removeFromCart" v-show="cart.length" v-on:click="removeFromCart">Remove</button>

        </div>
        
        <div>
            <h2>Reviews</h2>
            <p v-if="!reviews.length">There are no reviews yet.</p>
            <ul>
              <li v-for="review in reviews">
              <p>{{ review.name }}</p>
              <p>Rating: {{ review.rating }}</p>
              <p>«{{ review.review }}»</p>
              <p>Recommendation: {{ review.recommend }}</p>
              </li>
            </ul>
        </div>

        <product-review @review-submitted="addReview"></product-review>
   </div>
`,
    data() {
        return {
            product: "Socks",
            brand: 'Vue Mastery',
            description: "A pair of warm, fuzzy socks",
            selectedVariant: 0,
            altText: "A pair of socks",
            link: "https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=socks",
            inventory: 100,
            variants: [
                {
                    variantId: 2234,
                    variantColor: 'green',
                    variantImage: "./assets/vmSocks-green-onWhite.jpg",
                    variantQuantity: 100,
                    onSale: true
                },
                {
                    variantId: 2235,
                    variantColor: 'blue',
                    variantImage: "./assets/vmSocks-blue-onWhite.jpg",
                    variantQuantity: 1,
                    onSale:  false
                }
            ],
            sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
            reviews: []
        }
    },
    methods: {
        addToCart() {
            this.$emit('add-to-cart',
            this.variants[this.selectedVariant].variantId);
        },
        removeFromCart() {
            this.$emit('remove-from-cart',
            this.variants[this.selectedVariant].variantId);
        },
        updateProduct(index) {
            this.selectedVariant = index;
            console.log(index);
        },
        addReview(productReview) {
            this.reviews.push(productReview)
        }


    },
    computed: {
        title() {
            return this.brand + ' ' + this.product;
        },
        image() {
            return this.variants[this.selectedVariant].variantImage;
        },
        inStock(){
            return this.variants[this.selectedVariant].variantQuantity;
        },
        sale() {
            return this.variants[this.selectedVariant].onSale;
        },
        shipping() {
            if (this.premium) {
                return "Free";
            } else {
                return 2.99
            }
        }

    }
})



let app = new Vue({
    el: '#app',
    data: {
        premium: true,
        cart: [],
    },
    methods: {
        addToCart(id) {
            this.cart.push(id);
        },
        removeFromCart(id) {
            for(let i = this.cart.length - 1; i >= 0; --i){
                if (this.cart[i] === id){
                    this.cart.splice(i, 1);
                }

            }

        }
    }

})

