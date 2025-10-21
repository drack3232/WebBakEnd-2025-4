import { Command } from "commander";
import * as fs from "fs/promises";
import http from "http";
import { URL } from "url";
import * as fxp from "fast-xml-parser";

const program = new Command();

program
  .name("WebBack-4")
  .description("Вебсервер для фільтрації та виводу даних mtcars у XML")
  .version("1.0.3");

program
  .option("-i, --input <file>", "Input file path (e.g., mtcars.json)")
  .option("-h, --host <string>", "Server host", "127.0.0.1")
  .option("-p, --port <number>", "Port for server", "8080");

async function startServer() {
  program.parse(process.argv);
  const options = program.opts();

  if (!options.input) {
    console.error(
      "Помилка: Будь ласка, вкажіть шлях до вхідного файлу за допомогою -i або --input."
    );
    process.exit(1);
  }

  const host = options.host;
  const port = parseInt(options.port);

  const builder = new fxp.XMLBuilder({
    ignoreAttributes: false,
    format: false,
  });

  const requestListener = async function (req, res) {
    try {
      const fullUrl = new URL(req.url, `http://${host}:${port}`);
      const queryParams = fullUrl.searchParams;

      const showCylinders = queryParams.get("cylinders") === "true";
      const maxMpg = queryParams.get("max_mpg");

      const rawData = await fs.readFile(options.input, { encoding: "utf8" });
      const jsonObject = JSON.parse(rawData);

      let filteredCars = [];

      for (const modelName in jsonObject) {
        if (jsonObject.hasOwnProperty(modelName)) {
          const car = jsonObject[modelName];

          if (maxMpg !== null) {
            const maxMpgValue = parseFloat(maxMpg);
            if (car.mpg >= maxMpgValue) {
              continue;
            }
          }

          let carOutput = {
            model: modelName,
            cyl: car.cyl,
            mpg: car.mpg,
          };

          if (showCylinders) {
            carOutput.cyl = car.cyl;
          }

          filteredCars.push(carOutput);
        }
      }

      const xmlStructure = {
        cars: {
          car: filteredCars,
        },
      };

      const xmlOutput = builder.build(xmlStructure);
      const responseBuffer = Buffer.from(xmlOutput, "utf8");

      res.writeHead(200, {
        "Content-Type": "application/xml; charset=utf-8",
        "Content-Length": responseBuffer.length,
      });
      res.end(responseBuffer);
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.error("Cannot find input file"); 
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        res.end(`404 Not Found: Cannot find input file '${options.input}'`);
        
      } else {
        // Для всіх інших помилок (наприклад, невірний JSON)
        console.error(`Помилка під час обробки запиту: ${error.message}`);
        res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
        res.end(`Внутрішня помилка сервера: ${error.message}`);
      }
    }
  }

  const server = http.createServer(requestListener);

  server.listen(port, host, () => {
    console.log(`Сервер запущено: http://${host}:${port}`);
    console.log(`Використовується вхідний файл: ${options.input}`);
  });
}

startServer();