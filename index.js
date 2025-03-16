const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port=process.env.PORT || 5000
const app=express()
require('dotenv').config()

// middleware
app.use(express.json())
app.use(cors())

//learn-language
//HNOmghSJzAGTx43Z

// console.log(process.env.USER_DATA)
// console.log(process.env.USER_PASS)

const uri = `mongodb+srv://${process.env.USER_DATA}:${process.env.USER_PASS}@cluster0.0p516.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


// const uri = "mongodb+srv://learn-language:HNOmghSJzAGTx43Z@cluster0.0p516.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

  const TutorialsCollection=client.db("learn-language").collection("Tutorials")
  const UserCollection=client.db("learn-language").collection("User")

// user api
app.post("/users", async(req,res)=>{
  const data=req.body
  console.log(data)
  const result=await UserCollection.insertOne(data)
  res.send(result)
})


// user get

app.get("/users",async(req,res)=>{
  const data=await UserCollection.find().toArray();
  // const email=[...new Set(data.map(d=>d.name))]
  res.send(data)
})




  //Tutorials data post
  app.post("/tutorials", async(req,res)=>{
    const data=req.body
    console.log(data)
    const result=await TutorialsCollection.insertOne(data)
    res.send(result)
  })

  // tutorial get
  app.get("/tutorials",async(req,res)=>{
    const result=await TutorialsCollection.find().toArray()
    res.send(result)
  })

  //Delete tutorial

  app.delete("/tutorials/:id",async(req,res)=>{
    const id=req.params.id
    console.log(id)
    const query={_id:new ObjectId(id)}
    const result = await TutorialsCollection.deleteOne(query)
    res.send(result)
  })
//category api create

// app.get("/tutorials/categories", async(req , res)=>{
//    const categories=await TutorialsCollection.distinct("language")
//    res.send(categories)
// })

app.get("/tutorials/categories", async (req, res) => {
  const data = await TutorialsCollection.find().toArray();
  const languageCounts = data.reduce((acc, item) => {
    const language = item.language;
    acc[language] = (acc[language] || 0) + 1;
    return acc;
  }, {});

  // JSON formate 
  const response = Object.keys(languageCounts).map(language => ({
    language: language,
    totalTutors: languageCounts[language],
  }));

  res.send(response);
});

// total specific  language
app.get('/tutorials/language',async(req,res)=>{
  const language=req.query.language
  const query={language:language}
  const data=await TutorialsCollection.find(query).toArray()
  res.send(data)

})

// total  tutors  count api

app.get("/tutorials/tutors",async(req,res)=>{
  const data=await TutorialsCollection.find().toArray();
  const tutors=[...new Set(data.map(t=>t.name))]
  res.send(tutors)
});


  // id base data fetch

  app.get("/tutorials/:id",async(req,res)=>{
     const id=req.params.id
     const query={ _id:new ObjectId(id)}
     const result=await TutorialsCollection.findOne(query)
     res.send(result)
  })

  app.get("/tutorials/language/:language",async(req,res)=>{
    const language= req.params.language;
    const query = { language: language };
    const result= await TutorialsCollection.find(query).toArray()
    res.send(result)
 })

//user data update

  app.put("/tutorials/:id",async(req,res)=>{
    const id=req.params.id
    const data=req.body
    console.log(data)
    const filter={_id:new ObjectId(id)}
    const options = { upsert: true };
    const updateDoc = {
        $set: {
          name:data.name,
          email:data.email,
          image:data.image,
          language:data.language,
          review:data.review,
          price:data.price,
          description:data.description

        },
      };
      const result=await TutorialsCollection.updateOne(filter,updateDoc,options)
      res.send(result)
  })






    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get("/",(req,res)=>{
    res.send("Server is Running")
})
app.listen(port,()=>{
    console.log(`the CURD is Running ${port}`)
})
