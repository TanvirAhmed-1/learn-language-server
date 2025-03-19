
const jwt = require("jsonwebtoken");
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;
const app = express();
require("dotenv").config();
const cookieParser = require("cookie-parser");

// middleware

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

//token verify

const verifyToken=(req,res,next)=>{
  const token=req.cookies?.token
  if(!token){
    return res.status(401).send({message:"unauthorized access"})
  }
  //token verify
  jwt.verify(token,process.env.JWT_KEY,(err,decoded)=>{
    if(err){
      return res.status(401).send({message:"unauthorized user"})
    }
    req.user=decoded
    next()
  })
}

//learn-language
//HNOmghSJzAGTx43Z

const uri = `mongodb+srv://${process.env.USER_DATA}:${process.env.USER_PASS}@cluster0.0p516.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const TutorialsCollection = client
      .db("learn-language")
      .collection("Tutorials");
    const UserCollection = client.db("learn-language").collection("User");
    const BookTutorialsCollection = client
      .db("learn-language")
      .collection("Book-Tutorials");

    //jwt api
    // console.log(process.env.JWT_KEY);

    app.post("/jwt", async (req, res) => {
      const email = req.body;
      console.log("jwt", email);
      const token = jwt.sign(email, process.env.JWT_KEY, { expiresIn: "5h" });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: false,
        })
        .send({ success: true, token });
    });

    //JWT Token Remove

    app.post("/logout", async (req, res) => {
      res.clearCookie("token", {
        httpOnly: true,
        secure: false,
      });
      res.send({ success: true, message: "Logged out successfully" });
    });

    // user api
    app.post("/users", async (req, res) => {
      const data = req.body;
      console.log(data);
      const result = await UserCollection.insertOne(data);
      res.send(result);
    });

    //book Tutorials post api

    app.post("/book/tutorials", async (req, res) => {
      const data = req.body;
      const result = await BookTutorialsCollection.insertOne(data);
      res.send(result);
    });

    //get book tutorials api

    app.get("/book/tutorials",verifyToken, async (req, res) => {
      const email = req.query.email;
      // console.log("book",req.cookies?.token)
   
      if (req.user.email !== req.query.email) {
          return res.status(403).send({ message: 'forbidden access' })
      }
      const query = { email: email };
      const result = await BookTutorialsCollection.find(query).toArray();
      res.send(result);
    });

    app.patch("/book/tutorial/review/:id", async (req, res) => {
      const id = req.params.id;
      // console.log("tanvir", id);
      const query = { _id: new ObjectId(id) };
      const updateDoc = { $inc: { review: 1 } };

      const result = await BookTutorialsCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    // review count
    app.get("/tutorial/review/count", async (req, res) => {
      const result = await BookTutorialsCollection.aggregate([
        {
          $group: {
            _id: null,
            TotalReview: { $sum: "$review" },
          },
        },
      ]).toArray();
      res.send({ totalReviews: result[0]?.TotalReview || 0 });
    });

    // user get

    app.get("/users", async (req, res) => {
      const data = await UserCollection.find().toArray();
      // const email=[...new Set(data.map(d=>d.name))]
      res.send(data);
    });

    //Tutorials data post
    app.post("/tutorials", async (req, res) => {
      const data = req.body;
      console.log(data);
      const result = await TutorialsCollection.insertOne(data);
      res.send(result);
    });

    // tutorial get
    app.get("/tutorials", async (req, res) => {
      const result = await TutorialsCollection.find().toArray();
      res.send(result);
    });
    //email base data fetch
    app.get("/tutorials/email",verifyToken, async(req,res)=>{
      const email=req.query.email
      // console.log("email",req.cookies?.token)
      if (req.user.email !== req.query.email) {
        return res.status(403).send({ message: 'forbidden access' })
    }
      const query={email:email}
      const result=await TutorialsCollection.find(query).toArray()
      res.send(result)
    })

    //Delete tutorial

    app.delete("/tutorials/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await TutorialsCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/tutorials/categories", async (req, res) => {
      const data = await TutorialsCollection.find().toArray();
      const languageCounts = data.reduce((acc, item) => {
        const language = item.language;
        acc[language] = (acc[language] || 0) + 1;
        return acc;
      }, {});

      // JSON formate
      const response = Object.keys(languageCounts).map((language) => ({
        language: language,
        totalTutors: languageCounts[language],
      }));

      res.send(response);
    });

    // total specific  language
    app.get("/tutorials/language", async (req, res) => {
      const language = req.query.language;
      const query = { language: language };
      const data = await TutorialsCollection.find(query).toArray();
      res.send(data);
    });

    // total  tutors  count api

    app.get("/tutorials/tutors", async (req, res) => {
      const data = await TutorialsCollection.find().toArray();
      const tutors = [...new Set(data.map((t) => t.name))];
      res.send(tutors);
    });

    // id base data fetch

    app.get("/tutorials/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await TutorialsCollection.findOne(query);
      res.send(result);
    });

    app.get("/tutorials/language/:language", async (req, res) => {
      const language = req.params.language;
      const query = { language: language };
      const result = await TutorialsCollection.find(query).toArray();
      res.send(result);
    });

    //user data update

    app.put("/tutorials/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      console.log(data);
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          name: data.name,
          email: data.email,
          image: data.image,
          language: data.language,
          review: data.review,
          price: data.price,
          description: data.description,
        },
      };
      const result = await TutorialsCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is Running");
});
app.listen(port, () => {
  console.log(`the CURD is Running ${port}`);
});
