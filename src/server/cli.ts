import { Encryption } from "./encryption";

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

async function main() {
  const args = process.argv.slice(2);
  const command = args.at(0) || "help";

  const printHelp = () => {
    console.log("Usages:");
    console.log("  help");
    console.log("    print help message.");
    console.log("  decrypt <encryptionKey> <payloadEncoded>");
    console.log("    decrypt payload using key.");
  };

  if (command === "help") {
    printHelp();
    return;
  } else if (command === "decrypt") {
    const encryptionKey = args.at(1);
    const payloadEncoded = args.at(2);
    if (!encryptionKey || !payloadEncoded) {
      printHelp();
      return;
    }

    const encryption = new Encryption(encryptionKey);
    const text = encryption.decrypt(payloadEncoded);
    console.log(text);
    return;
  }
}
