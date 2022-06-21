import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")

connectButton.onclick = connect
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw
fundButton.onclick = fund

async function connect() {
  if (typeof window.ethereum !== undefined) {
    console.log("I see a metamask")
    await window.ethereum.request({ method: "eth_requestAccounts" })
    console.log("Connected!")
    connectButton.innerHTML = "Connected"
  } else {
    connectButton.innerHTML = "Please install metamask"
  }
}

async function getBalance() {
  if (typeof window.ethereum !== undefined) {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const balance = await provider.getBalance(contractAddress)
    console.log(ethers.utils.formatEther(balance))
  }
}

async function withdraw() {
  if (typeof window.ethereum !== undefined) {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    try {
      console.log("Withdrawing")
      const txResponse = await contract.withdraw()
      // listen for the tx to be mined
      await listenForTxMined(txResponse, provider)
      console.log("Done")
    } catch (error) {
      console.log(error)
    }
  }
}

async function fund() {
  const ethAmount = document.getElementById("ethAmount").value
  console.log(`Funding with ${ethAmount}...`)
  if (typeof window.ethereum !== undefined) {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    try {
      const txResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      })
      // listen for the tx to be mined
      await listenForTxMined(txResponse, provider)
      console.log("Done")
    } catch (error) {
      console.log(error)
    }
  }
}

function listenForTxMined(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}...`)
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(
        `Completed with ${transactionReceipt.confirmations} confirmations`
      )
      resolve()
    })
  })
}
