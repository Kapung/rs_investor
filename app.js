const { exit } = require("process")
const readLine = require("readline")
const rL = readLine.createInterface({
    input: process.stdin,
    output: process.stdout
})

function mainMenu() {
    console.log(`Commands:\n'add' to add items into investments\n'view' to view your current investments\n'edit' to edit your current investments\n'delete' to delete your current investments\n'calculate' to check your profits or losses\n'exit' to exit the program`)
    
    rL.question("\nPlease enter your command: ", (cmd) => {
        switch(cmd.toLowerCase()) {
            case "add":
                break
            case "view":
                break
            case "edit":
                break
            case "delete":
                break
            case "calculate":
                break
            case "exit":
                console.log("Goodbye...")
                process.exit()
            default:
                console.log("\nUnknown command, please try again\n")
                mainMenu()
        }
    })
}

mainMenu()