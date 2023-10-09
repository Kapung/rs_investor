const fs = require("fs")
const readLine = require("readline")

const inventoryFp = "inventory.json"
let inventory = saveAndLoadInventory(inventoryFp) //Loads the data on launch

const rL = readLine.createInterface({
    input: process.stdin,
    output: process.stdout
})

function mainMenu() {
    console.log(`\nCommands:\n'add' to add items into investments\n'view' to view your current investments\n'edit' to edit your current investments\n'delete' to delete your current investments\n'calculate' to check your profits or losses\n'exit' to exit the program`)
    
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

//I added returns because it kept going further than it was supposed to even when I called recursive
async function appAdd() {
    const item = await askQuestion("\nWhat item would you like to add: ")
    if (item == "exit") {
        mainMenu()
        return
    }
    if (!item) {
        console.log("No input was given please try again")
        appAdd()
        return
    }
    const itemObj = await getItem(item)
    if (!itemObj) {
        console.log("Item was not found...returning")
        mainMenu()
        return
    }
    const quantity = await askQuestion("\nHow many: ")
    const price = await askQuestion("\nWhat price: ")
    const total = parseInt(quantity) * parseInt(price)

    let tempInventory = []

    if (inventory) {
        tempInventory = inventory.inventory
        console.log(tempInventory)
    }
    tempInventory.push({"itemID": await getItemID(itemObj), "item": item, "price": parseInt(price), "quantity": parseInt(quantity), "total_used": total})
    const data = {
        "timestamp": getCurrentTime(),
        "inventory": tempInventory
    }
    inventory = saveAndLoadInventory(inventoryFp, data)
    mainMenu()
}

function appView() {
    
    mainMenu()
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

function saveAndLoadInventory(fP, data) {
    try {
        let fileData = null

        //Checks if the file exists otherwise creates new
        if (fs.existsSync(fP)) {
            const content = fs.readFileSync(fP, "utf8")
            fileData = JSON.parse(content)
            console.log("Inventory has been loaded")
        } else {
            console.log(`File ${fP} doesn't exist, creating new file`)
        }

        //Checks if given data exists
        if (data) {
            const json = JSON.stringify(data, null, 2)
            fs.writeFileSync(fP, json)
            console.log(`Inventory has been updated: ${fP}`)
        } else {
            console.log("No data given....skipping")
        }

        return fileData
    } catch (err) {
        console.log(`Error in inventory management ${err}`)
    }
}

//Gets item information from Runewikis API
async function getItem(itemName) {
    const encoded = encodeURIComponent(itemName)
    const apiURL = `https://api.weirdgloop.org/exchange/history/rs/latest?name=${encoded}&lang=en`
    try {
        const response = await fetch(apiURL)
        if (!response.ok) {
            console.log(`getItem response error, status: ${response.status}`)
            return
        }
        const data = await response.json()
        for (const iName in data) {
            if (data.hasOwnProperty(iName)) {
                const item = data[iName]
                return item
            }
        }
    } catch (err) {
        console.log(`getItemId error: ${err.message}`)
    }
}

async function getItemID(item) {
    return item.id
}

async function getItemPrice(item) {
    return item.price
}

async function getItemVolume(item) {
    return item.volume
}

function getCurrentTime() {
    const current = new Date()
    const ts = current.toISOString()
    return ts
}

mainMenu()