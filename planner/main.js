require('dotenv').config()
const fetch = require('node-fetch')
const express = require('express')

const port = process.env.PORT || 3000
const nbTasks = parseInt(process.env.TASKS) || 20

const randInt = (min, max) => Math.floor(Math.random() * (max - min)) + min
const taskType = () => (randInt(0, 2) ? 'mult' : 'add')
const args = () => ({ a: randInt(0, 40), b: randInt(0, 40) })

const generateTasks = (i) =>
  new Array(i).fill(1).map((_) => ({ type: taskType(), args: args() }))

  let workers = []


const app = express()
app.use(express.json())
app.use(
  express.urlencoded({
    extended: true,
  })
)

app.get('/', (req, res) => {
  res.send(JSON.stringify(workers))
})

app.post('/register', (req, res) => {
  const { url, id } = req.body
  console.log(`Register: adding ${url} worker: ${id}`)
  workers.push({ url, id })
  res.send('ok')
})

let tasks = generateTasks(nbTasks)
let taskToDo = nbTasks

const wait = (mili) =>
  new Promise((resolve, reject) => setTimeout(resolve, mili))

  const sendTask = async (task) => {
    if (workers.length === 0 || tasks.length === 0) return
    for (let i = 0; i < workers.length; i++) {
      console.log(`=> ${workers[i]}/${task.type}`, task)
      fetch(`${workers[i]}/${task.type}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task.args),
      })
        .then((res) => {
          taskToDo -= 1
          console.log('---')
          console.log(nbTasks - taskToDo, '/', nbTasks, ':')
          console.log(task, 'has res', res)
          console.log('---')
          return res
        })
        .catch((err) => {
          console.error(task, ' failed', err.message)
          tasks = [...tasks, task]
        })
    }
  }
  

const main = async () => {
  console.log(tasks)
  while (taskToDo > 0) {
    await wait(100)
    if (workers.length === 0 || tasks.length === 0) continue;
    for (let i = 0; i < workers.length; i++) {
      sendTask(workers[i], tasks[i % tasks.length]);
}

  }
  console.log('end of tasks')
  server.close()
}

const server = app.listen(port, () => {
  console.log(`Register listening at http://localhost:${port}`)
  console.log('starting tasks...')
  main()
})
