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
                appAdd()
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

function askQuestion(question) {
    return new Promise((resolve) => {
        rL.question(question, resolve)
    })
}

async function appAdd() {
    const item = await askQuestion("\nWhat item would you like to add: ")
    console.log(await getItemId(item))
    mainMenu()
}

function appView() {
    return
}

function appEdit() {
    return
}

function appDelete() {
    return
}

function appCalculate() {
    return
}

async function getItemId(itemName) {
    const encoded = encodeURIComponent(itemName)
    const apiURL = `https://api.weirdgloop.org/exchange/history/rs/latest?name=${encoded}&lang=en`
    try {
        const response = await fetch(apiURL)
        const data = await response.json()
        for (const iName in data) {
            if (data.hasOwnProperty(iName)) {
                const item = data[iName]
                const id = item.id
                return id
            }
        }
    } catch (err) {
        console.log(`getItemId error: ${err.message}`)
    }
}

async function getItemPrice(id) {
    
}

mainMenu()