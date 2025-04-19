import { execSync } from "node:child_process";

console.log("SECRET_MANAGER_ENV start");
console.log(process.env.SECRET_MANAGER_ENV);
console.log("SECRET_MANAGER_ENV done");

const command = process.argv.slice(2).join(" ");
console.log("command:", command);

execSync(command, {
  shell: true,
  stdio: "inherit",
  env: {
    ...process.env,
    ...Object.fromEntries(
      process.env.SECRET_MANAGER_ENV.split("\n").map((x) => x.split("="))
    ),
  },
});
