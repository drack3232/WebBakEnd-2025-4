import { Command } from "commander";
import fs from "fs"
import http from "http"
const program = new Command();

program
  .name("WebBack-4")
  .description("")
  .version("1.0.0");

program
  .option("-i, --input [file]", "Input file path")
 .option("-h, --host[string]", "Server host")
 .option("-p, --port[number]", "port for server")

  program.parse(process.argv)
  const option = program.opts();

  if(option.input === true || !option.input){
    console.error("Please, specify input file");
  process.exit(1);
  }

  if(!fs.existsSync(options.input)){
    console.error("Cannot find input file")
    process.exit(1)
}

const host = option.host || '127.0.0.1';
const port = option.port ? parseInt(options.port) : 8080;

const requestListner = function (req, res){
    res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Web server is running and input file is ' + options.input);
}

const server =  http.createServer(requestListener);

server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
  console.log(`Using input file: ${options.input}`);
})