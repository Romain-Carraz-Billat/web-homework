// pixels-war.js

let user_id = null
let gridWidth = 0
let gridHeight = 0

function getPickedColorInRGB() {
    const colorHexa = document.getElementById("colorpicker").value
    const r = parseInt(colorHexa.substring(1, 3), 16)
    const g = parseInt(colorHexa.substring(3, 5), 16)
    const b = parseInt(colorHexa.substring(5, 7), 16)
    return [r, g, b]
}

function pickColorFrom(div) {
    const bg = window.getComputedStyle(div).backgroundColor
    const [r, g, b] = bg.match(/\d+/g)
    const rh = parseInt(r).toString(16).padStart(2, '0')
    const gh = parseInt(g).toString(16).padStart(2, '0')
    const bh = parseInt(b).toString(16).padStart(2, '0')
    document.getElementById("colorpicker").value = `#${rh}${gh}${bh}`
}

function refresh(user_id, prefix) {
    fetch(`${prefix}/deltas?id=${user_id}`, { credentials: "include" })
        .then(res => res.json())
        .then(json => {
            const pixels = document.querySelectorAll("#grid > div")
            json.pixels.forEach(p => {
                const index = p.y * gridWidth + p.x
                const pixel = pixels[index]
                if (pixel) {
                    pixel.style.backgroundColor = `rgb(${p.r}, ${p.g}, ${p.b})`
                }
            })
        })
}

function initializeGrid(baseUrl, mapId) {
    const PREFIX = `${baseUrl}/api/v1/${mapId}`
    document.getElementById("baseurl").value = baseUrl
    document.getElementById("mapid").value = mapId

    fetch(`${PREFIX}/preinit`, { credentials: "include" })
        .then(res => res.json())
        .then(json => {
            console.log("Preinit:", json)
            user_id = json.id
            gridWidth = json.width
            gridHeight = json.height

            const grid = document.getElementById("grid")
            grid.style.gridTemplateColumns = `repeat(${gridWidth}, 4px)`
            grid.style.gridTemplateRows = `repeat(${gridHeight}, 4px)`
            grid.innerHTML = ""

            for (let y = 0; y < gridHeight; y++) {
                for (let x = 0; x < gridWidth; x++) {
                    const div = document.createElement("div")
                    div.dataset.x = x
                    div.dataset.y = y
                    div.style.width = "4px"
                    div.style.height = "4px"
                    div.style.backgroundColor = "#FFFFFF"

                    div.addEventListener("click", () => {
                        const [r, g, b] = getPickedColorInRGB()
                        fetch(`${PREFIX}/set/${user_id}/${x}/${y}/${r}/${g}/${b}`, {
                            credentials: "include"
                        }).then(() => refresh(user_id, PREFIX))
                    })

                    div.addEventListener("mouseover", () => {
                        console.log(`Pixel (${x}, ${y})`)
                    })

                    grid.appendChild(div)
                }
            }

            document.getElementById("refresh").addEventListener("click", () => {
                refresh(user_id, PREFIX)
            })

            setInterval(() => refresh(user_id, PREFIX), 3000)
        })
}

document.addEventListener("DOMContentLoaded", () => {
    const connectDialog = document.getElementById("connect-dialog")

    let connectBtn = document.getElementById("connect-btn")
    if (!connectBtn) {
        connectBtn = document.createElement("button")
        connectBtn.id = "connect-btn"
        connectBtn.innerText = "Connect"
        connectBtn.type = "button"
        connectDialog.appendChild(connectBtn)
    }

    connectBtn.addEventListener("click", () => {
        const baseUrl = document.getElementById("baseurl").value.trim()
        const mapId = document.getElementById("mapid").value.trim()
        if (baseUrl && mapId) {
            initializeGrid(baseUrl, mapId)
        } else {
            alert("Merci de remplir l'URL et la carte.")
        }
    })
})
