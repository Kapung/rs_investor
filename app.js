const fs = require("fs")
const readLine = require("readline")

const inventoryFp = "inventory.json" //Inventory filepath
const profitFp = "currency.json"     //Profit filepath

const rL = readLine.createInterface({
    input: process.stdin,
    output: process.stdout
})

//Handles all user input
async function mainMenu() {
    console.log(`\nCommands:\n'add' to add items into investments\n'view' to view your current investments\n'edit' to edit your current item quantity\n'delete' to delete your current investments\n'calculate' to check your profits or losses\n'sell' to sell item of your choice\n'history' to print sales history\n'exit' to exit the program`)
    const inventory = await saveAndLoadInventory(inventoryFp)
    rL.question("\nPlease enter your command: ", (cmd) => {
        switch(cmd.toLowerCase()) {
            case "add":
                appAdd(inventory)
                break
            case "view":
                appView(inventory)
                break
            case "edit":
                appEdit(inventory)
                break
            case "delete":
                appDelete(inventory)
                break
            case "calculate":
                appCalculate(inventory)
                break
            case "sell":
                appSell(inventory)
                break
            case 'history':
                appSalesHistory()
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

//Capitalizes first letter
function capitalize(str) {
    return str.charAt(0).toUpperCase()+str.slice(1)
}

//Asynced version of question
function askQuestion(question) {
    return new Promise((resolve) => {
        rL.question(question, resolve)
    })
}

//I added returns because it kept going further than it was supposed to even when I called recursive
async function appAdd(inventory) {
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

    //Checks if items exist in inventory if they do it loads them into temp inventory
    if (inventory && inventory.inventory) {
        tempInventory = inventory.inventory
    }
    tempInventory.push({"itemID": await getItemID(itemObj), "item": capitalize(item), "price": parseInt(price), "quantity": parseInt(quantity), "total_used": total, "timestamp": getCurrentTime()})
    const data = {
        "inventory": tempInventory
    }
    inventory = await saveAndLoadInventory(inventoryFp, data)
    mainMenu()
}

//Prints out the current inventory of items if any exists
async function appView(inventory) {
    if (inventory && inventory.inventory) {
        console.log("\nItems in the inventory currently\n")
        for (const item of inventory.inventory) {
            console.log(`${item.item} x${item.quantity} - ${item.price}gp each`)
        }
    } else {
        console.log("There aren't any items in your inventory")
        mainMenu()
        return
    }

    mainMenu()
}

//Edits existing value quantities
async function appEdit(inventory) {
    if (inventory && inventory.inventory) {
        const editItem = await askQuestion("What item would you like to edit: ")
        const index = inventory.inventory.findIndex(item => item.item == capitalize(editItem))

        if (index !== -1) {
            const item = inventory.inventory[index]
            const newNumber = await askQuestion("How many do you now have: ")
            item.quantity = parseInt(newNumber)
            item.total_used = item.quantity * item.price
            data = {
                "inventory": inventory.inventory
            }
            inventory = await saveAndLoadInventory(inventoryFp, data) 
            console.log(`${capitalize(editItem)} has been updated`)

        } else {
            console.log(`${capitalize(editItem)} not found in the inventory`)
        }
    }
    mainMenu()
}

//Handles item deletion from the inventory by the earliest appearance if duplicate
async function appDelete(inventory) {
    if (inventory && inventory.inventory) {
        const removableItem = await askQuestion("What item would you like to remove: ")
        const index = inventory.inventory.findIndex(item => item.item == capitalize(removableItem))
        if (index !== -1) {
            inventory.inventory.splice(index, 1)
            const data = {
                "inventory": inventory.inventory
            }
    
            inventory = await saveAndLoadInventory(inventoryFp, data)
            console.log(`${capitalize(removableItem)} has been removed from inventory`)
        } else {
            console.log(`${capitalize(removableItem)} not found in the inventory`)
        }
    } else {
        console.log("Inventory is empty")
    }
    mainMenu()
}

//Calculates and prints out current profit margins
async function appCalculate(inventory) {
    if (inventory && inventory.inventory) {
        console.log("")
        for (item of inventory.inventory) {
            currentPrice = await getItemPrice(await getItem(item.item))
            total_result = currentPrice * item.quantity
            profitMargin = ((total_result - item.total_used) / item.total_used) * 100
            if ((total_result - item.total_used) >= 0) {
                console.log(`You used ${item.total_used}gp to buy ${item.quantity} ${item.item} and you've earned ${total_result - item.total_used}gp so far with profit margin of ${profitMargin.toFixed(1)}%`)
            } else {
                console.log(`You used ${item.total_used}gp to buy ${item.quantity} ${item.item} and you've lost ${total_result - item.total_used}gp so far with profit margin of ${profitMargin.toFixed(1)}%`)
            }
        }
    } else {
        console.log("Inventory is empty")
    }
    mainMenu()
}

//Sell x amount of existing item
async function appSell(inventory) {
    const profit = await saveAndLoadInventory(profitFp)
    if (inventory && inventory.inventory) {
        const itemAsked = await askQuestion("Which item would you like to sell: ")
        const index = inventory.inventory.findIndex(item => item.item == capitalize(itemAsked))
        if (index !== -1) {
            item = inventory.inventory[index]
            const sellQuantity = await askQuestion(`How many would you like to sell out of ${item.quantity}: `)
            if (sellQuantity <= item.quantity) {
                const currentPrice = await getItemPrice(await getItem(itemAsked))
                const totalSell = sellQuantity * currentPrice
                const saleProfit = totalSell - item.total_used
                const temp = item.price
                item.quantity = parseInt(item.quantity - sellQuantity)
                item.total_used = item.quantity * item.price
                
                if (item.quantity == 0) {
                    inventory.inventory.splice(index, 1)
                }

                data = {
                    "inventory": inventory.inventory
                }

                inventory = await saveAndLoadInventory(inventoryFp, data)
                let tempInv = []

                if (profit) {
                    tempInv = profit.sales
                }
                tempInv.push({"profit": saleProfit, "timestamp": getCurrentTime(), "item": capitalize(itemAsked), "amount": parseInt(sellQuantity), "soldAt": currentPrice, "boughtAt": temp})

                const sales = {
                    "sales": tempInv
                }

                await saveAndLoadInventory(profitFp, sales)
            } else {
                console.log("Sorry you can't sell more than you have, returning to main menu")
            }
        } else {
            console(`Item by the name of ${itemAsked} does not exist`)
        }
    } else {
        console.log("Inventory is empty")
    }
    mainMenu()
}

//Prints out currency.json
async function appSalesHistory() {
    profits = await saveAndLoadInventory(profitFp) 
    for (item of profits.sales) {
        console.log(`\nYou made ${item.profit}gp with ${capitalize(item.item)} by selling at ${item.soldAt}gp and buying at ${item.boughtAt}gp\nDate: ${formatTime(item.timestamp)}`)
    }
    mainMenu()
}

//Saves items to inventory if given parameter otherwise only loads the file
async function saveAndLoadInventory(fP, data) {
    try {
        let fileData = null

        //Checks if the file exists otherwise creates new
        if (fs.existsSync(fP)) {
            const content = fs.readFileSync(fP, "utf8")
            fileData = JSON.parse(content)
        }

        //Checks if given data exists
        if (data) {
            fileData = data
            const json = JSON.stringify(data, null, 2)
            fs.writeFileSync(fP, json)
            console.log(`Inventory has been updated: ${fP}`)
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

//Returns item id of getItem function
async function getItemID(item) {
    return item.id
}

//Returns item price of getItem function
async function getItemPrice(item) {
    return item.price
}

//Returns current time as timestamp
function getCurrentTime() {
    const current = new Date()
    const ts = current.toISOString()
    return ts
}

//Formats given timestamp to readable form
function formatTime(iso) {
    const date = new Date(iso)
    const options = {year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit"}
    return date.toLocaleDateString("en-US", options)
}

mainMenu()