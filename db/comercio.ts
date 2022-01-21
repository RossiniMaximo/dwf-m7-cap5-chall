import { sequelize } from ".";
import { Model, DataTypes } from "sequelize";

/* sequelize.sync({ force: true }).then((res) => {
  console.log(res);
}); */

export class Comerce extends Model {}

Comerce.init(
  {
    name: DataTypes.STRING,
    area: DataTypes.STRING,
    lat: DataTypes.FLOAT,
    lng: DataTypes.FLOAT,
  },
  { sequelize, modelName: "Comercio" }
);
