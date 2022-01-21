import * as express from "express";
import { index } from "../lib";
import * as cors from "cors";
import { Comerce } from "../db/comercio";
const API_URL = "http://localhost:3001";
const app = express();

const port = process.env.PORT || 3001;
app.use(express.json());
app.use(cors());
app.get("/comerces", async (req, res) => {
  const comerces = await Comerce.findAll();
  res.json(comerces);
});

app.get("/comerces/:id", async (req, res) => {
  const comerce = await Comerce.findByPk(req.params.id);
  res.json(comerce);
});

function hitsSimplifier(body) {
  const { name, lat, lng, area, objectID } = body;
  const res: any = {};
  console.log("soy el body:", body);
  body.forEach((e) => {
    console.log("soy e :", e._geoloc.lat);
    res.name = e.name;
    res.area = e.area;
    res.objectID = e.objectID;
    res.lat = e._geoloc.lat;
    res.lng = e._geoloc.lng;
  });
  // console.log("soy res:", res);
  return res;
}
app.get(API_URL + "/comerces-nearby", async (req, res) => {
  const { lat, lng } = req.query;
  console.log("soy la lat", lat);
  const { hits } = await index.search("", {
    aroundLatLng: [lat, lng].join(","),
    aroundRadius: 10000,
  });
  console.log(hits);
  const simplifiedReturn = hitsSimplifier(hits);
  res.json(simplifiedReturn);
});

app.post("/comerce", async (req, res) => {
  const newComerce = await Comerce.create(req.body);
  const saveInAlgolia = await index.saveObject({
    objectID: newComerce.get("id"),
    name: newComerce.get("name"),
    area: newComerce.get("area"),
    _geoloc: {
      lat: newComerce.get("lat"),
      lng: newComerce.get("lng"),
    },
  });
  res.json(newComerce);
});

function indexsBody(body, id?) {
  const { name, area, lat, lng } = body;
  const response: any = {};
  if (name) {
    response.name = name;
  }
  if (area) {
    response.area = area;
  }
  if (lat && lng) {
    response._geoloc = { lat, lng };
  }
  if (id) {
    response.objectID = id;
  }
  return response;
}

app.put("/comerces/:id", async (req, res) => {
  const comerce = await Comerce.update(req.body, {
    where: { id: req.params.id },
  });
  const indexItems = indexsBody(req.body, req.params.id);
  console.log(indexItems);

  const saveInAlgolia = await index.partialUpdateObject(indexItems);
  console.log(saveInAlgolia);

  res.json(comerce);
});

app.delete("/comerces/:id", async (req, res) => {
  const comerce = await Comerce.findByPk(req.params.id);
  comerce.destroy();
});

app.get("*", express.static("/public/index.html"));

app.listen(port, () => {
  console.log("El servidor esta corriendo de manera exitosa", port);
});
