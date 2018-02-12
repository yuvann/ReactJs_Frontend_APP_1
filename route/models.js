var express = require('express');
var router = express.Router();

const { Pool }= require('pg');
const connectionString = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/scapic_test';

var storage = [] ;
router.post('/', function(req, res) {

  var {limit , offset ,category_id }= req.body;
  if(limit == undefined ){
     limit  = 5  ;   // default values
  }
  if(offset == undefined ){
     offset = 0 ;   //  default values
  }
  if(category_id == undefined ){
     res.status(400).send({"error":"Category ID not Found"});
  }
  else{
    traverseId(category_id , 0 , limit , offset , res);
  }

});

function traverseId( category_id , index , limit , offset , response){
       if(index == category_id.length){
           response.status(200).send(storage);
           storage = [];
           return ;
       }
       var respObj = {};
       const pool = new Pool({
          connectionString: connectionString,
       })
       pool.query('SELECT * from models where category_id=$1 limit $2 offset $3',[category_id[index] , limit, offset], (err, result) => {
         if( err ) 
	    handleErr(pool);
         else 
         {
	       respObj.data = result.rows ;
	       pool.query('SELECT count(*) from models where category_id=$1 ',[ category_id[index] ],(err, result) => {
		  if( err ) 
	   	       handleErr(pool);
      		  else 
      		  {
               	    respObj.count = result.rows[0].count ;
       	            storage.push( respObj );
		    pool.end();
                    traverseId(category_id ,index+1 , limit , offset , response)
                  } 
               });
         }
       });  
}

function handleErr(pool){
   console.log("DB ERR");
   pool.end();
   return {};
}

module.exports = router;