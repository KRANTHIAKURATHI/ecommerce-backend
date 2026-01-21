const express = require("express");
const pool = require("../database");
const auth = require("../middleware/auth");

const router = express.Router();

/* ADD TO CART */
router.post("/cart/add/:product_id", auth, async (req,res)=>{
  const {product_id} = req.params;
  const {quantity} = req.body;
  const user_id = parseInt(req.user.user_id) || 0;  // Convert to integer
  const qty = parseInt(quantity) || 1;
  const prod_id = parseInt(product_id) || 0;  // Convert to integer

  if (!user_id || !prod_id) {
    return res.status(400).json({error: 'Invalid user_id or product_id'});
  }

  try {
    const db = await pool();  // Call the function to get the pool
    console.log('Adding to cart - user_id:', user_id, 'product_id:', prod_id, 'qty:', qty);
    
    // Get or create cart for user
    const [cart] = await db.query("SELECT cart_id FROM cart WHERE user_id=?", [user_id]);
    let cart_id;

    if(cart.length === 0) {
      console.log('Creating new cart for user:', user_id);
      const [newCart] = await db.query("INSERT INTO cart(user_id) VALUES(?)", [user_id]);
      cart_id = newCart.insertId;
      console.log('New cart created with id:', cart_id);
    } else {
      cart_id = cart[0].cart_id;
      console.log('Using existing cart:', cart_id);
    }

    // Check if product already in cart
    const [existing] = await db.query("SELECT * FROM cart_items WHERE cart_id=? AND product_id=?", [cart_id, prod_id]);

    if(existing.length > 0) {
      // Update quantity
      console.log('Updating quantity for product:', prod_id);
      await db.query("UPDATE cart_items SET quantity = quantity + ? WHERE cart_id=? AND product_id=?", [qty, cart_id, prod_id]);
    } else {
      // Add new item
      console.log('Adding new item to cart');
      await db.query("INSERT INTO cart_items(cart_id, product_id, quantity) VALUES(?,?,?)", [cart_id, prod_id, qty]);
    }
    
    res.json({success: true, message: 'Item added to cart'});
  } catch(err) {
    console.error('Error adding to cart:', err);
    res.status(500).json({error: err.message});
  }
});

/* GET CART */
router.get("/cart", auth, async (req,res)=>{
  try {
    const db = await pool();
    const user_id = parseInt(req.user.user_id) || 0;
    console.log('Fetching cart for user_id:', user_id);
    
    if (!user_id) {
      return res.status(400).json({error: 'Invalid user_id'});
    }
    
    const [cart] = await db.query("SELECT cart_id FROM cart WHERE user_id=?", [user_id]);
    if(!cart.length) {
      console.log('No cart found for user');
      return res.json({success: true, data: {cart_items: []}});
    }

    console.log('Cart found:', cart[0].cart_id);
    const [items] = await db.query(
      `SELECT ci.product_id,ci.quantity,p.product_name,p.amount AS price,p.imageURL
       FROM cart_items ci
       JOIN product p ON ci.product_id=p.product_id
       WHERE ci.cart_id=?`,
      [cart[0].cart_id]
    );

    console.log('Items in cart:', items.length);
    res.json({success: true, data: {cart_items: items}});
  } catch(err) {
    console.error('Error fetching cart:', err);
    res.status(500).json({error: err.message});
  }
});

/* UPDATE QUANTITY */
router.put("/cart/update-quantity", auth, async (req,res)=>{
  const {product_id,action} = req.body;
  const user_id = parseInt(req.user.user_id) || 0;
  const prod_id = parseInt(product_id) || 0;
  
  if (!user_id || !prod_id) {
    return res.status(400).json({error: 'Invalid user_id or product_id'});
  }
  
  try {
    const db = await pool();
    const [[cart]] = await db.query("SELECT cart_id FROM cart WHERE user_id=?", [user_id]);

    const change = action==="inc"?1:-1;
    await db.query(
      "UPDATE cart_items SET quantity = GREATEST(1, quantity+?) WHERE cart_id=? AND product_id=?",
      [change, cart.cart_id, prod_id]
    );
    res.json({success:true});
  } catch(err) {
    console.error('Error updating quantity:', err);
    res.status(500).json({error: err.message});
  }
});

/* REMOVE */
router.delete("/cart/remove/:product_id", auth, async (req,res)=>{
  const user_id = parseInt(req.user.user_id) || 0;
  const prod_id = parseInt(req.params.product_id) || 0;
  
  if (!user_id || !prod_id) {
    return res.status(400).json({error: 'Invalid user_id or product_id'});
  }
  
  try {
    const db = await pool();
    const [[cart]] = await db.query("SELECT cart_id FROM cart WHERE user_id=?", [user_id]);
    await db.query("DELETE FROM cart_items WHERE cart_id=? AND product_id=?",[cart.cart_id, prod_id]);
    res.json({success:true});
  } catch(err) {
    console.error('Error removing item:', err);
    res.status(500).json({error: err.message});
  }
});

/* PLACE ORDER */
router.post("/cart/placeorder", auth, async (req,res)=>{
  const user_id = parseInt(req.user.user_id) || 0;
  
  if (!user_id) {
    return res.status(400).json({error: 'Invalid user_id'});
  }
  
  const db = await pool();
  const conn = await db.getConnection();
  try{
    await conn.beginTransaction();

    const [[cart]] = await conn.query("SELECT cart_id FROM cart WHERE user_id=?", [user_id]);

    const [items] = await conn.query(
      "SELECT product_id,quantity,amount FROM cart_items JOIN product USING(product_id) WHERE cart_id=?",
      [cart.cart_id]
    );

    const total = items.reduce((s,i)=>s+i.amount*i.quantity,0);

    const [order] = await conn.query(
      "INSERT INTO orders(user_id,amount,order_date) VALUES(?,?,NOW())",
      [user_id,total]
    );

    for(const i of items){
      await conn.query(
        "INSERT INTO order_item(order_id,product_id,quantity) VALUES(?,?,?)",
        [order.insertId,i.product_id,i.quantity]
      );
    }

    await conn.query("DELETE FROM cart_items WHERE cart_id=?", [cart.cart_id]);
    await conn.commit();
    res.json({success:true,order_id:order.insertId});
  }catch(e){
    await conn.rollback();
    res.status(500).json({error:String(e)});
  }finally{
    conn.release();
  }
});

module.exports = router;
