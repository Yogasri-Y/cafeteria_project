var express = require("express")
var bodyParser = require("body-parser")
var mongoose = require("mongoose")
const ejs=require('ejs');
const app = express();
var fs = require('fs');
var path = require('path');
require('dotenv/config');

const stripe = require('stripe')('sk_test_51M7IoOSGHNdj06JRPfm98NsGBTnxO8XjdLIdx5wYeixCf73Y8peGwzfXVDHBbQWbF7c6DZM3Cq56Mj1H83Sy8DTp00EAf646Et');
app.set('view engine','ejs');
app.engine('html',require('ejs').renderFile)
app.use(express.static('./views'));
app.set('views',"./views");
app.use(bodyParser.json())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({
    extended:true
}))

mongoose.connect('mongodb://localhost:27017/cafeteria',{
    useNewUrlParser: true,
    useUnifiedTopology: true
});
app.use(bodyParser.urlencoded({ extended: false }))

var db = mongoose.connection;

db.on('error',()=>console.log("Error in Connecting to Database"));
db.once('open',()=>console.log("Connected to Database"))


// sign up
app.get("/",(req,res)=>{
    
    return res.redirect('home.html');
});

app.get("/sign_up",function(req,res){
    res.redirect("register.html");
})

 var email;
 var name;
app.post("/sign_up",(req,res)=>{
     name = req.body.name;
    email = req.body.email;
    var phno = req.body.numner;
    var password = req.body.password;
    var address=req.body.address;
    var data = {
        "name": name,
        "c_mail" : email,
        "mobile": phno,
        "c_password" : password,
        "address" : address,
        "code":1
    }

    db.collection('customers').insertOne(data,(err,collection)=>{
        if(err){
            throw err;
        }
        console.log("Record Inserted Successfully");
    });

    return res.redirect('menu')

})

//login
const customersSchema={
    name:String,
    c_mail:String,
    mobile:String,
    address:String,
    c_password:String,
    code:Number
}
const Customer= mongoose.model('Customer',customersSchema);
app.get("/loginDetails", function (req, res) {
    res.redirect("login.html");
});
 var email;
 var password;
app.post("/loginDetails", function(req, res) {
    email=req.body.email;
     password=req.body.password;
     checkpass(req,res,email,password)
})
app.get('/login',checkpass);
function checkpass(req,res,email,password){
    mongoose.model('Customer').findOne({c_mail:email,c_password:password},function(err,customers){
        console.log(customers);
		if(customers!= null){
            console.log(customers.c_password);
            console.log("Done Login");
            mongoose.model('Customer').updateOne({c_mail:email},{$set:{code:1}},(err,collection)=>{
                if(err){
                    throw err;
                }
                console.log("Record Inserted Successfully");
})              

                res.redirect('menu')
				
			}      
        else{
			console.log("failed");
            res.redirect('login.html')
		}
	});
};


//profile


app.get('/',(req,res)=>{
    res.render('home');
})
app.get("/profile",(req,res)=>{
    Customer.find({c_mail:email,code:1},function(err,customers){
        console.log(email);
       res.render('profile',{
        customersList:customers}
       
       )

    })
})

// update profile address
app.get("/update_addr",function(req,res){
    res.redirect("update_address.html");
})

app.post("/update_addr",(req,res)=>{
    var flat = req.body.flat;
   var area = req.body.area;
    var city = req.body.city;
    var add=flat+","+area+","+city;
   

    db.collection('customers').updateOne({c_mail:email},{$set:{address:add}},(err,collection)=>{
        if(err){
            throw err;
        }
        console.log("Record updated Successfully");
    });

    return res.redirect('profile')

})

//update_delivery address
app.get("/update1",function(req,res){
    res.redirect("update_address1.html");
})

app.post("/update1",(req,res)=>{
    var flat = req.body.flat;
   var area = req.body.area;
    var city = req.body.city;
    var add=flat+","+area+","+city;
   

    db.collection('customers').updateOne({c_mail:email},{$set:{address:add}},(err,collection)=>{
        if(err){
            throw err;
        }
        console.log("Record updated Successfully");
     
    });

    return res.redirect('checkout')

})

//update profile information
app.get('/',(req,res)=>{
    res.render('home');
})

app.get('/update_profile',(req,res)=>{
    Customer.find({c_mail:email},function(err,customers){
        console.log(email);
       res.render('update_profile',{
        customersList:customers,
       
       })

    })
})
app.post("/update_pro",(req,res)=>{
    var number = req.body.number;
    var newpass = req.body.new_pass;
    var password=req.body.confirm_pass;
    if(newpass == password){
    db.collection('customers').updateOne({c_mail:email},{$set:{mobile:number,c_password:password}},(err,collection)=>{
        if(err){
            throw err;
        }
        console.log("Record updated Successfully");
    });

     res.redirect('profile')
}
})

//update the delivery information
app.get('/',(req,res)=>{
    res.render('home');
})

app.get('/update_profile1',(req,res)=>{
    Customer.find({c_mail:email},function(err,customers){
        console.log(email);
       res.render('update_profile1',{
        customersList:customers,
       
       })

    })
})
app.post("/updatepro",(req,res)=>{
    var number = req.body.number;
    var newpass = req.body.new_pass;
    var password=req.body.confirm_pass;
    if(newpass == password){
    db.collection('customers').updateOne({c_mail:email},{$set:{mobile:number,c_password:password}},(err,collection)=>{
        if(err){
            throw err;
        }
        console.log("Record updated Successfully");
    });

     res.redirect('checkout')
}
})



var multer = require('multer');
  
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});
  
var upload = multer({ storage: storage });
var imgModel = require('./model');
const { nextTick } = require("process");
app.get('/',(req,res)=>{
    res.render('home');
})
app.get('/menu', (req, res) => {
  imgModel.find({item_id:{$not:/^B/}}, (err, items) => {
      if (err) {
          console.log(err);
          res.status(500).send('An error occurred', err);
      }
      else {
          res.render('menu', { items: items });
      }
  });
});
var multer = require('multer');
  
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});
  

app.get('/',(req,res)=>{
    res.render('home');
})
app.get('/desserts', (req, res) => {
  imgModel.find({item_id:/^B/}, (err, items) => {
      if (err) {
          console.log(err);
          res.status(500).send('An error occurred', err);
      }
      else {
          res.render('desserts', { items: items });
      }
  });
});

//searching
var multer = require('multer');
  
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});
  

app.get('/searching',(req,res)=>{
    imgModel.find({}, (err, items) => {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred', err);
        }
        else {
            res.render('searching', { items: items });
        }
    });
})
app.post('/ser',(req,res)=>{
    var s=req.body.searching;
    search(req,res,s)
})
app.get('/searching', search) 
function search(req,res,s){

  imgModel.find({item_name:{$regex:'^'+s, $options:'i'}}, (err, items) => {
      if (err) {
          console.log(err);
          res.status(500).send('An error occurred', err);
      }
      else {
          res.render('searching', { items: items });
      }
  });
};
var amount;
var total;
app.post('/cartadd',(req,res)=>{
       var id=req.body.id;
      var qty=req.body.qty;
       amt=req.body.price;
      amount=amt*qty;
      var name=req.body.name;
   //   total=amount+total;
      var data={
        "item_id":id,
        "email":email,
        "quantity":qty,
        "total_price":amount,
        "item_name":name
      }
      db.collection('customers').findOne({c_mail:email,code:1},function(err,logins){
        if(logins!=null){
            console.log('hello')
      db.collection("orders").insertOne(data,(err,collection)=>{
        if(err){
            throw err;
        }
        else{
        console.log("record inserted successfully")     
        }
    })
}
else{
    res.redirect('login.html')
}
})

})

 //view add to cart

 var ordersSchema= new mongoose.Schema({
    item_id:String,
    email:String,
    quantity:String,
    total_price:Number

})
const Order=mongoose.model('Order',ordersSchema);

app.get("/",(req,res)=>{
    res.render('home')
})
//edit
var id;
app.post('/edit',(req,res)=>{
     id=req.body.id;
      var qty=req.body.qty;
       amt=req.body.price;
      amount=amt*qty;
    console.log(id)
    console.log(qty)
    db.collection('orders').updateOne({email:email,item_id:id},{$set:{quantity:qty,total_price:amount}},(err,collection)=>{
        if(err)
        console.log(err)
        console.log('record update')
    })
      console.log('chaNGING')
          res.redirect('cart')
    

})


//view cart
var pid;

app.get('/cart',(req,res)=>{
    db.collection('customers').findOne({c_mail:email,code:1},function(err,logins){
        if(logins!=null){
    db.collection('orders').find({email:email}).toArray(function(err,orders){
        //console.log(orders.item_id)
     if(err){
         console.log(err);
         res.status(500).send('An error occurred', err);
     }
        else
        {
            var subtotal=[];
            var oid=[];
            console.log(orders.length)

            for(i=0;i<orders.length;i++){
                pid=orders[i].item_id;
                oid.push(pid);
               subtotal.push(orders[i].total_price);
               
            }
           var total=0;
           console.log(subtotal)
            for(i=0;i<subtotal.length;i++){
                total=total+subtotal[i]
            }
            console.log(oid)
            console.log(total)
            console.log('hellohi')
            imgModel.find({item_id:oid}, (err, items) => {
                if (err) {
                    console.log(err);
                    res.status(500).send('An error occurred', err);
                }
                else {
                  console.log('storing')
                    res.render('cart', {total:total,items:items});
                 //   oid.splice(0,orders.length);
                }
               })

          console.log('hrllo')
         }
           })
        }
        else{
            res.redirect('login.html')
        }
        })
    
        
           
 })
   

 //delete the product from cart
var did;
app.post("/cartbtn",(req,res)=>{
    did=req.body.sid;
    console.log('delete1');
   deletecart(req,res,did)
    
})
app.get('/cart',deletecart);
function deletecart(req,res,did){
mongoose.model('Order').deleteOne({email:email,item_id:did},(err,orders)=>{
    if(err)
    console.log(err)
  else{
    cartdisplay(req,res)
  }
})
}
app.get('/cart',cartdisplay) 
function cartdisplay(req,res){
    db.collection('orders').find({email:email}).toArray(function(err,orders){
        //console.log(orders.item_id)
     if(err){
         console.log(err);
         res.status(500).send('An error occurred', err);
     }
        else
        {
            var subtotal=[]
            var oid=[];
            console.log(orders.length)

            for(i=0;i<orders.length;i++){
                pid=orders[i].item_id;
                oid.push(pid);    
                subtotal.push(orders[i].total_price)          
            }
            var total=0;
          // console.log(subtotal)
            for(i=0;i<subtotal.length;i++){
                total=total+subtotal[i]
            }
            console.log(oid)
            imgModel.find({item_id:oid}, (err, items) => {
                if (err) {
                    console.log(err);
                    res.status(500).send('An error occurred', err);
                }
                else {
                  console.log('storing')
                    res.render('cart', {total:total, items: items});
                 //   oid.splice(0,orders.length);
                }
               })

          console.log('deleteone')
         }
           })
    }

//delete all product from cart
app.post("/deleteall",(req,res)=>{
    console.log('coming');
   deletecartall(req,res)
    
})
app.get('/cart',deletecartall);
function deletecartall(req,res){
mongoose.model('Order').deleteMany({email:email},(err,orders)=>{
    if(err)
    console.log(err)
  else{
    console.log('deleting')
    imgModel.find({}, (err, items) => {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred', err);
        }
        else {
            res.render('menu', { items: items });
        }
    });
  }
})
}

//update checkouts
app.get('/',(req,res)=>{
    res.render('home.html');
})
var totals=0;
app.get('/checkout',(req,res)=>{
    
    var orders=[];
    db.collection('orders').find({email:email}).toArray(function(err,orders){
        //console.log(orders.item_id)
     if(err){
         console.log(err);
         res.status(500).send('An error occurred', err);
     }
        else
        {
            totals=0;
            var subtotal=[];
            var oid=[]
            var name=[];
            console.log(orders.length)

            for(i=0;i<orders.length;i++){
                pid=orders[i].item_id;
                oid.push(pid);
               subtotal.push(orders[i].total_price);
               //console.log(orders[i].item_name)
            }
           
           console.log(subtotal)
            for(i=0;i<subtotal.length;i++){
                totals=totals+subtotal[i]
            }
            console.log(oid)
            console.log(orders)
         }
           })
          console.log(orders.length) 
    Customer.find({c_mail:email},function(err,customers){
        console.log('after')
        console.log(email);    
        res.render('checkout',{orders:orders,total:totals,customersList:customers})
    })
    console.log('orders')
    console.log('hi')
  //  console.log(customers)
    console.log(totals)
   
})
app.get('/getJson',function(req,res){
    console.log('welcome')
    console.log(req.body.selectpicker);
})
app.post('/payment',(req,res)=>{
    var id=req.body.txtDate;
   var id1=req.body.Date;
  var date=new Date();
    var awa=req.body.away;
    var time=req.body.time;
    var op=req.body.selectedmode;
    
   var data={
    "email":email,
    "total_amount":totals,
     "From":id,
     "To":id1,
     "order_date":date,
    "payment_method":"credit card",
    "method_delivery":"Delivery",
    "delivery_time":time,
    "status":"paid"
   }
   db.collection('billings').insertOne(data,(err,collection)=>{
     if(err)
       console.log(err)
     
   })
   return res.redirect('paypage2.html')
})
//view the orders
const billingsSchema={
    email:String,
    total_amount:String,
    From:String,
    To:String,
    order_date:String,
    method_delivery:String,
    delivery_time:String,
}
const Billing= mongoose.model('Billing',billingsSchema);
app.get('/',(req,res)=>{
    res.render('home.html');
})
app.get("/orders",(req,res)=>{
    Billing.find({email:email,status:"paid"},function(err,billings){
        console.log(email);
       res.render('orders',{
        billings:billings,name:name}
       
       )

    })
})
//payment
app.post("/charge", (req, res) => {
    try {
        stripe.customers
          .create({          
            email: req.body.email,
            source: req.body.stripeToken
            
          })
          .then(customer =>
            stripe.charges.create({
              amount: req.body.amount * 100,
              currency: "usd",
              customer: customer.id
            })
          )
          .then(()=> res.render('success1.html'))     
          .catch(err => console.log(err));
         // console.log('hello')
      } catch (err) {
        res.send(err);
      }
    //  res.redirect("success.html");
});
app.get('/',(req,res)=>{
    res.redirect('success1.html')
})
/*function viewall(req,res){
app.post("/yes",(req,res)=>{
    victory(req,res);})
app.get('/success1',victory)
function victory(req,res)
{
db.collection('billings').updateOne({email:email},{$set:{status:"paid"}},(err,collection)=>{
        if(err){
            throw err;
        }
        console.log("Record updated Successfully");
    });
    mongoose.model('Order').deleteMany({email:email},(err,orders)=>{
        if(err)
        console.log(err)
      else{
        console.log('deleting')
        imgModel.find({}, (err, items) => {
            if (err) {
                console.log(err);
                res.status(500).send('An error occurred', err);
            }
            else {
                res.render('menu', { items: items });
            }
        });
    }
})

}*/

app.get('/',(req,res)=>{
    res.render('home');
})

app.get('/contact',(req,res)=>{
    Customer.find({c_mail:email},function(err,customers){
        console.log(email);
       res.render('contact',{
        customersList:customers,
       
       })

    })
})
app.post('/say',(req,res)=>{
    var ph=req.body.ph;
    var con=req.body.con;
    var data={
        "email":email,
        "contact":ph,
        "content":con
    }
    mongoose.model('Customer').findOne({c_mail:email,code:1},function(err,logins){
        if(logins!=null){
    db.collection('reviews').insertOne(data,(err,collection)=>{
        if(err)
          console.log(err)
        
      })
       res.redirect('home.html')}
       else{
        res.redirect('login.html')
       }
    })

})

app.get('/',(req,res)=>{  
    try {  
    imgModel.find((err,data)=>{  
    if(err){  
    console.log(err)  
    }else{  
    res.render('home',{data:data});  
    }  
    });  
    } catch (error) {  
    console.log(error);  
    }  
    });  
    
 
    


//logout
app.post('/logo',(req,res)=>{
    logopage(req,res)
})
app.get('/logout',logopage)
function logopage(req,res){


    mongoose.model('Customer').updateOne({c_mail:email},{$set:{code:0}},(err,logins)=>{
        console.log(email);
        console.log('hello')
       

    })
    res.redirect('home.html');
}

//port number
var port = process.env.PORT || 5500;
app.listen(port, function () {
    console.log("Server Has Started!");
});

