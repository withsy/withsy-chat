import { execSync } from "node:child_process";

// console.log("SECRET_MANAGER_ENV start");
// console.log(process.env.SECRET_MANAGER_ENV);
// console.log("SECRET_MANAGER_ENV end");

const command = process.argv.slice(2).join(" ");
// console.log("command:", command);

const env = {
  ...process.env,
  ...Object.fromEntries(
    process.env.SECRET_MANAGER_ENV.split("\n").map((x) => x.split("="))
  ),
};
// console.log("env start");
// console.log(env);
// console.log("env end");

execSync(command, {
  shell: true,
  stdio: "inherit",
  env,
});
