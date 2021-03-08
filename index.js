const { Converter } = require("csvtojson");
const fs = require("fs");
const path = require("path");
const csv = require("csvtojson");
const JSONStream = require("JSONStream");

const files = fs.readdirSync("./csv/");
const csvPath = "./csv/";

const finalData = [];
allZone = [];

const convertData = async () => {
  for (const file of files) {
    console.log(file);
    if (file === "parquimetros_tempo_xml.csv") {
      try {
        const jsonData = await csv({
          noheader: false,
          delimiter: ",",
          quote: '"',
          // headers: ['CodigoZonaGeo', 'NombreZonaGeo'],
        }).fromFile(csvPath + file);

        /*
    IdSistema: '2',                         Codigo: '1624',                     Nombre: 'Ayto. Madrid',
    IdZonaGeo: '2',                         Codigo2: '1',                       Nombre3: 'Madrid',
    UMonetariaPorDefecto: 'EUR',            IdZonaHoraria: 'Europe/Madrid',     IdCiudad: '1',
    IdZonaGeo4: '2',                        Codigo5: '1',                       Nombre6: 'SER',
    IdUsuario: '10',                        Nombre7: '01 - Devas I',            IdZonaFisica: '32',
    IdCiudad8: '1',                         Codigo9: '61',                      Nombre10: '61 Bellas Vistas',
    latitud: '40.452092703134',             Longitud: '-3.7068777881969',       zoom: '15',
    IdPqLogico: '4756',                     IdSistema11: '2',                   IdCiudad12: '1',
    Direccion: 'C/ Doctor Santero, 13 frente al nº 12',                         Observaciones: 'Etra-Normal-Vea',
    IdZonaFisica13: '32',                   Maquina: '7472',                    Alias: '106120356',
    latitud14: '40.447633',                 Longitud15: '-3.705488',            zoom16: '0'
    */

        /*
     "id": 3,
    "name": "61 Bellas Vistas",
    "code": 61,
    "position": {
      "latitude": 40.4520927031335,
      "longitude": -3.706877788,
      "zoom": 15
    },
    "parkingmeters": []
*/

        createZone(jsonData);

        let code = null;
        let index = 1;
        for (let i = 0; i < jsonData.length; i++) {
          if (!code || code != jsonData[i]["Codigo9"]) {
            code = jsonData[i]["Codigo9"];
            let parent = {
              id: index,
              name: jsonData[i]["Nombre10"],
              code: parseInt(jsonData[i]["Codigo9"]),
              position: {
                latitude: jsonData[i]["latitud"],
                longitude: jsonData[i]["Longitud"],
                zoom: jsonData[i]["zoom"],
              },
              parkingmeters: [],
            };

            let item = finalData.find((item) => item.code === parent.code);

            if (!item) {
              finalData.push(parent);
              index++;
            }
          }
        }

        data = Array.from(finalData);

        for (let i = 0; i < jsonData.length; i++) {
          for (let k = 0; k < data.length; k++) {
            if (data[k].code == jsonData[i]["Codigo9"]) {
              let child = {
                idDevice: jsonData[i]["Alias"],
                latitude: jsonData[i]["latitud14"],
                longitude: jsonData[i]["Longitud15"],
              };

              let item = finalData.find(
                (item) => item.idDevice === child.idDevice
              );

              if (!item) {
                data[k].parkingmeters.push(child);
              }
            }
          }
        }

        fs.writeFileSync("./finalData.json", JSON.stringify(data, null, 4));
      } catch (error) {
        console.error("faild to load", error);
      }
    }
  }
};

createZone = (jsonData) => {
  let cities = [];
  let cityId;
  for (let i = 0; i < jsonData.length; i++) {
    if (!cityId || cityId != jsonData[i]["IdCiudad"]) {
      cityId = jsonData[i]["IdCiudad"];
      let city = {
        id: jsonData[i]["IdCiudad"],
        name: jsonData[i]["Nombre3"],
        subChild: [],
      };

      let item = cities.find((item) => item.id === city.id);

      if (!item) {
        cities.push(city);
      }
    }
  }

  //zone.push(cities);

  for (let j = 0; j < cities.length; j++) {
    for (let i = 0; i < jsonData.length; i++) {
      if (cities[j].id === jsonData[i]["IdCiudad"]) {
        let zone = {
          id: parseInt("10" + jsonData[i]["IdUsuario"]),
          name: jsonData[i]["Nombre7"],
          subChild: [],
        };

        let item = cities[j].subChild.find((item) => item.id === zone.id);
        if (!item) {
          cities[j].subChild.push(zone);
        }
      }
    }
  }


let index = 1
  for (let j = 0; j < cities.length; j++) {
    for (let i = 0; i < cities[j].subChild.length; i++) {
      for (let k = 0; k < jsonData.length; k++) {
        if (cities[j].subChild[i].name === jsonData[k]["Nombre7"]) {
          let el = {
            id: index,
            name: jsonData[k]["Nombre10"],
          };

          let item = cities[j].subChild[i].subChild.find(
            (item) => item.name === el.name
          );
          if (!item) {
            cities[j].subChild[i].subChild.push(el);
            index++
          }
        }
      }
    }
  }

  fs.writeFileSync("./zone.json", JSON.stringify(cities, null, 4));
};

convertData();
