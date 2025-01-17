import { ObjectId } from "mongodb";
// import { DBConfig } from "../const.js";

export async function connect(client) {
  try {
    await client.connect();
    return await client.db('podtree'); // DBConfig.DB_NAME
  } catch (e) {
    console.log(e);
    // Ensures that the client will close when you finish/error
    await client.close();
    return null;
  }
}

// key --- must be 'keyword'
function parseKeywordQuery(fields, query){
  if(query){
    const keyword = query['keyword'];
    if(keyword){
      const keywordQueries = [];
      fields.forEach(field => {
        keywordQueries.push({[field]: { $regex: keyword}});
      });
  
      const q = {...query};
      delete q.keyword;
  
      return {...q, $or: keywordQueries};
    }else{
      return query; // keyword=''
    }
  }else{
    return {};
  }
}

// query : { k1: v1, k2: v2 }
export async function find(model, query) {
  const dbClient = model.dbClient;
  const name = model.name;
  const q = parseKeywordQuery(model.fields, query);
  try {
    const db = await connect(dbClient);
    if (db) {
      const collection = db.collection(name);
      const data = await collection.find(q).toArray();
      return { data, error: null };
    } else {
      return { data: null, error: "Nonsql lost connection" };
    }
  } catch (error) {
    return { data: null, error };
  }
}

export async function createCollections(dbClient, collections) {
  try {
    const db = await connect(dbClient);
    const rs = await db.getCollectionNames();

    for(let i=0; i<collections.length; i++){
      const collection = collections[i];
      if(rs.indexOf(collection) === -1){
        await db.createCollection(collection);
      }
    }
  } catch (error) {
    console.log(error);
  }
}

export async function findOne(model, query) {
  const dbClient = model.dbClient;
  const name = model.name;

  try {
    const db = await connect(dbClient);
    if (db) {
      const collection = db.collection(name);
      const data = await collection.find(query).toArray();
      if(data && data.length > 0){
        return { data: data[0], error: null };
      }else{
        return { data: null, error: null};
      }
    } else {
      return { data: null, error: "Nonsql lost connection" };
    }
  } catch (error) {
    return { data: null, error };
  }
}
// return {
// acknowledged:
// true
// insertedId:
// 62e3cb58f80c6f22be6ab57c
// }
export async function insertOne(model, doc) {
  const dbClient = model.dbClient;
  const name = model.name;
  const timestamp = new Date().toISOString();
  doc.created = timestamp;
  doc.updated = timestamp;

  try {
    const db = await connect(dbClient);
    if (db) {
      const collection = db.collection(name);
      const data = await collection.insertOne(doc);
      return { data, error: null };
    } else {
      return { data: null, error: "Nonsql lost connection" };
    }
  } catch (error) {
    return { data: null, error };
  }
}

export async function insertMany(model, docs) {
  const dbClient = model.dbClient;
  const name = model.name;
  try {
    const db = await connect(dbClient);
    if (db) {
      const collection = db.collection(name);
      const data = await collection.insertMany(docs);
      return { data, error: null };
    } else {
      return { data: null, error: "Nonsql lost connection" };
    }
  } catch (error) {
    return { data: null, error };
  }
}

export async function updateOne(model, query, doc) {
  const dbClient = model.dbClient;
  const name = model.name;

  try {
    const db = await connect(dbClient);
    if (db) {
      const collection = db.collection(name);
      const data = await collection.updateOne(query, doc);
      return { data, error: null };
    } else {
      return { data: null, error: "Nonsql lost connection" };
    }
  } catch (error) {
    return { data: null, error };
  }
}

// items --- eg. [{ 'updateOne': {filter: {xx}, update: {xx} }}]
export async function bulkUpdate(model, items) {
  const dbClient = model.dbClient;
  const name = model.name;

  try {
    const db = await connect(dbClient);
    if (db) {
      const collection = db.collection(name);

      const updates = [];

      if (items && items.length > 0) {
        items.forEach((it) => {
          updates.push({
            updateOne: {
              ...it.updateOne,
              filter: { _id: new ObjectId(it.updateOne.filter._id) },
              update: { $set: it.updateOne.update },
            },
          });
        });

        const data = await collection.bulkWrite(updates);
        return { data, error: null };
      } else {
        return { data: null, error: null };
      }
    } else {
      return { data: null, error: "Nonsql lost connection" };
    }
  } catch (error) {
    return { data: null, error };
  }
}


export async function deleteOne(model, id) {
  const dbClient = model.dbClient;
  const name = model.name;

  try {
    const db = await connect(dbClient);
    if (db) {
      const collection = db.collection(name);
      const query = { _id: new ObjectId(id) };
      const data = await collection.deleteOne(query);
      return { data, error: null };
    } else {
      return { data: null, error: "Nonsql lost connection" };
    }
  } catch (error) {
    return { data: null, error };
  }
}

export async function deleteMany(model, query) {
  const dbClient = model.dbClient;
  const name = model.name;

  try {
    const db = await connect(dbClient);
    if (db) {
      const collection = db.collection(name);
      const data = await collection.deleteMany(query);
      return { data, error: null };
    } else {
      return { data: null, error: "Nonsql lost connection" };
    }
  } catch (error) {
    return { data: null, error };
  }
}

// v2
export async function join(collection, fields, collections) {
  const lookupStages = collections.map(({ name, localName, outputName, fields }) => ({
    $lookup: {
      from: name,
      let: { foreignKey: `$${localName}` },
      pipeline: [
        { $match: { $expr: { $eq: [ `$_id`, `$$foreignKey` ] } } },
        { $project: { _id: 0, ...collectionsToProjection(fields) } },
        { $addFields: { [`${outputName}`]: "$$ROOT" } },
        { $replaceRoot: { newRoot: `$${outputName}` } }
      ],
      as: outputName
    }
  }));

  const projectStages = fields.reduce((acc, field) => ({ ...acc, [field]: 1 }), {});

  const pipeline = [
    { $match: {} },
    ...lookupStages,
    { $project: { _id: 0, ...projectStages } }
  ];

  return await collection.aggregate(pipeline).toArray();
}

function collectionsToProjection(fields) {
  return fields.reduce((acc, field) => ({ ...acc, [field]: 1 }), {});
}


export async function aggregate(model, pipeline) {
  const dbClient = model.dbClient;
  const name = model.name;

  try {
    const db = await connect(dbClient);
    if (db) {
      const collection = db.collection(name);
      // const data = await join(collection, fields, collections);// collection.aggregate(pipeline);
      const data = await collection.aggregate(pipeline).toArray();

      if(data && data.length > 0){
        return { data, error: null };
      }else{
        return { data: null, error: null};
      }
    } else {
      return { data: null, error: "Nonsql lost connection" };
    }
  } catch (error) {
    return { data: null, error };
  }
}



